import { HosoRecord, XMLGroup, getXmlDataList } from './xml';

export type RuleType = 'Xuất toán' | 'Cảnh báo';

export interface ValidationRule {
    id: string;
    active: boolean;
    type: RuleType;
    xmlType: string;
    field?: string;
    name: string;
    description?: string;
    code: string; // The evaluation logic
    mathExpression?: string; // Optional: Code for mathematical calculation
    checkNotNull?: boolean; // Optional: Check if field is not null
    conditionField?: string; // Optional: Field to check condition on
    conditionValue?: string; // Optional: Comma-separated values for the condition field
    conditionMaDichVu?: string; // Optional: Field name for service code
    conditionMaDichVuValue?: string; // Optional: Comma-separated values for service code
    errorMessage?: string; // Optional: Custom error message to display
}

export interface ValidationResult {
    ruleId: string;
    ruleName: string;
    type: RuleType;
    xmlType: string;
    field?: string;
    message: string;
    isError: boolean;
    index?: number; // Row index for list items
}

const XML_LIST_PATHS: Record<string, string> = {
    'XML1': 'TONG_HOP',
    'XML2': 'CHITIEU_CHITIET_THUOC.DSACH_CHI_TIET_THUOC.CHI_TIET_THUOC',
    'XML3': 'CHITIEU_CHITIET_DVKT_VTYT.DSACH_CHI_TIET_DVKT.CHI_TIET_DVKT',
    'XML4': 'CHITIEU_CHITIET_DICHVUCANLAMSANG.DSACH_CHI_TIET_CLS.CHI_TIET_CLS',
    'XML5': 'CHITIEU_CHITIET_DIENBIENLAMSANG.DSACH_CHI_TIET_DIEN_BIEN_BENH.CHI_TIET_DIEN_BIEN_BENH',
    // XML7 is usually a single object CHI_TIEU_DU_LIEU_GIAY_RA_VIEN, or treated as flat.
};

/**
 * A basic validation engine that evaluates rules against a HosoRecord.
 * Rules can reference different XML groups.
 */
export class ValidationEngine {
    private rules: ValidationRule[] = [];

    constructor(rules: ValidationRule[] = []) {
        this.rules = rules;
    }

    setRules(rules: ValidationRule[]) {
        this.rules = rules;
    }

    validate(record: HosoRecord): ValidationResult[] {
        const results: ValidationResult[] = [];
        const activeRules = this.rules.filter(r => r.active);

        // Create a root context with all XML data available
        const rootContext: Record<string, any> = {};
        record.groups.forEach(g => {
            if (g.type === 'XML1' && g.data?.TONG_HOP) {
                rootContext[g.type] = g.data.TONG_HOP;
            } else {
                rootContext[g.type] = g.data;
            }
        });

        // Add shortcuts for strict XML structure if needed, or helper to get list

        activeRules.forEach(rule => {
            try {
                // Determine if this rule targets a list type and needs iteration
                const listPath = XML_LIST_PATHS[rule.xmlType];

                if (rule.xmlType === 'XML1' || !listPath) {
                    // Single object validation (XML1 or others)
                    // For XML1, we might want to unwrap TONG_HOP
                    // Merge fields from the specific XML type (e.g. XML1 fields) into top level
                    // so that context['MA_TTDV'] works for Null Checks.
                    let context = {
                        ...rootContext,
                        ...(rootContext[rule.xmlType] || {})
                    };

                    let isError = false;

                    if (rule.code && rule.code.trim()) {
                        isError = this.evaluateRuleCode(rule.code, context);
                    }

                    if (!isError && rule.mathExpression && rule.mathExpression.trim()) {
                        try {
                            isError = this.evaluateMath(rule.mathExpression, context);
                        } catch (e) {
                            isError = false;
                        }
                    }

                    if (!isError && rule.checkNotNull && rule.field) {
                        const val = context[rule.field];
                        if (val === undefined || val === null || val === '') isError = true;
                    }

                    if (isError) {
                        results.push(this.createResult(rule));
                    }
                } else {
                    // List validation (XML2, 3, 4, 5)
                    // Find the group
                    const group = record.groups.find(g => g.type === rule.xmlType);
                    const list = getXmlDataList(group);

                    // const rawData = rootContext[rule.xmlType];
                    // const list = this.getListData(rawData, listPath);

                    if (list && Array.isArray(list)) {
                        list.forEach((item, index) => {
                            // Check Generic Condition if specified
                            if (rule.conditionField && rule.conditionValue) {
                                // Helper to safe get value from item or context
                                // We can reuse the getVal logic but it's inside evaluateRuleCode. 
                                // Simple access for now: check item then root
                                let conditionVal = item[rule.conditionField];
                                if (conditionVal === undefined) {
                                    // Check if it's a nested path or in root context? 
                                    // For simplicity in list items, we usually check fields on the item itself (e.g. MA_NHOM)
                                    // But let's support robust checking if needed.
                                }

                                // Support comma-separated list of allowed values
                                const allowedValues = rule.conditionValue.split(',').map((s: string) => s.trim());

                                // Check if value exists and matches one of the allowed values
                                // We convert to string and trim to handle cases like " 1" or type mismatches
                                const valStr = conditionVal !== null && conditionVal !== undefined ? String(conditionVal).trim() : '';

                                if (!valStr || !allowedValues.includes(valStr)) {
                                    return;
                                }
                            }

                            // Context for this item:
                            // We allow accessing the specific item via its XML type name (e.g. XML3.NGAY_YL)
                            // And accessing global context (XML1.NGAY_VAO)
                            const itemContext = {
                                ...rootContext,
                                [rule.xmlType]: item, // Overwrite the raw list with the specific item for this key
                                'XML': item // Generic alias for the current item
                            };

                            // Also allow direct field access if the code assumes "this" is the item
                            // But for safety and clarity in "code", explicit XML3.FIELD is better.
                            // We can merge item into context root for "implicit" access if we wanted, 
                            // but let's stick to the rule code format.

                            // Check 'implicit' access? 
                            // If user writes "NGAY_YL < ...", we should look in [rule.xmlType] first.
                            const extendedContext = { ...itemContext, ...item }; // Merge item props to top level for convenience

                            let isError = false;

                            if (rule.code && rule.code.trim()) {
                                isError = this.evaluateRuleCode(rule.code, extendedContext);
                            }

                            if (!isError && rule.mathExpression && rule.mathExpression.trim()) {
                                try {
                                    isError = this.evaluateMath(rule.mathExpression, extendedContext);
                                } catch (e) {
                                    isError = false;
                                }
                            }

                            if (!isError && rule.checkNotNull && rule.field) {
                                const val = extendedContext[rule.field];
                                if (val === undefined || val === null || val === '') isError = true;
                            }

                            if (isError) {
                                results.push(this.createResult(rule, index));
                            }
                        });
                    }
                }

            } catch (err) {
                console.error(`Error evaluating rule ${rule.id}:`, err);
            }
        });

        return results;
    }

    private getListData(data: any, path: string): any[] {
        if (!data) return [];
        let current = data;
        const parts = path.split('.');
        for (const part of parts) {
            if (current === undefined || current === null) return [];
            current = current[part];
        }
        const list = Array.isArray(current) ? current : (current ? [current] : []);
        // Filter boolean to match the UI rendering which uses .filter(Boolean)
        // This ensures indices (0, 1, 2...) are consistent between Validator and UI
        return list.filter((item: any) => item);
    }

    private createResult(rule: ValidationRule, index?: number): ValidationResult {
        return {
            ruleId: rule.id,
            ruleName: rule.name,
            type: rule.type,
            xmlType: rule.xmlType,
            field: rule.field,
            message: rule.errorMessage || rule.name,
            isError: rule.type === 'Xuất toán',
            index
        };
    }

    public evaluateRule(rule: ValidationRule, record: HosoRecord): { isMatch: boolean, error?: string } {
        try {
            const rootContext: Record<string, any> = {};
            record.groups.forEach(g => {
                if (g.type === 'XML1' && g.data?.TONG_HOP) {
                    rootContext[g.type] = g.data.TONG_HOP;
                } else {
                    rootContext[g.type] = g.data;
                }
            });
            rootContext['root'] = rootContext;

            const checkLogic = (ctx: any) => {
                let isError = false;

                // 1. Check strict Logic Code
                if (rule.code && rule.code.trim()) {
                    isError = this.evaluateRuleCode(rule.code, ctx, true);
                }

                // 2. Check Math Expression (if present)
                if (!isError && rule.mathExpression && rule.mathExpression.trim()) {
                    try {
                        isError = this.evaluateMath(rule.mathExpression, ctx);
                    } catch (e) {
                        isError = false;
                    }
                }

                // 3. Check Not Null (if checked)
                if (!isError && rule.checkNotNull && rule.field) {
                    const val = ctx[rule.field];
                    const isNull = val === undefined || val === null || val === '';
                    if (isNull) isError = true;
                }

                return isError;
            };

            const listPath = XML_LIST_PATHS[rule.xmlType];

            if (rule.xmlType === 'XML1' || !listPath) {
                const context = { ...rootContext, ...rootContext[rule.xmlType] || {} };
                try {
                    const result = checkLogic(context);
                    return { isMatch: result };
                } catch (e: any) {
                    return { isMatch: false, error: e.message || String(e) };
                }
            }

            const group = record.groups.find(g => g.type === rule.xmlType);
            const list = getXmlDataList(group);

            if (!list || !Array.isArray(list) || list.length === 0) {
                return { isMatch: false };
            }

            for (const item of list) {
                if (rule.conditionField && rule.conditionValue) {
                    let conditionVal = item[rule.conditionField];
                    const allowedValues = rule.conditionValue.split(',').map((s: string) => s.trim());
                    const valStr = conditionVal !== null && conditionVal !== undefined ? String(conditionVal).trim() : '';
                    if (!valStr || !allowedValues.includes(valStr)) {
                        continue;
                    }
                }

                if (rule.conditionMaDichVuValue) {
                    const fieldToCheck = rule.conditionMaDichVu || 'MA_DICH_VU';
                    let conditionVal = item[fieldToCheck];
                    // Fallback: if scanning for generic service/drug/material
                    if (conditionVal === undefined && !rule.conditionMaDichVu) {
                        conditionVal = item['MA_DICH_VU'] || item['MA_THUOC'] || item['MA_VAT_TU'];
                    }

                    const allowedValues = rule.conditionMaDichVuValue.split(',').map((s: string) => s.trim());
                    const valStr = conditionVal !== null && conditionVal !== undefined ? String(conditionVal).trim() : '';
                    if (!valStr || !allowedValues.includes(valStr)) {
                        continue;
                    }
                }

                const itemContext = {
                    ...rootContext,
                    [rule.xmlType]: item,
                    'XML': item,
                    ...item
                };

                try {
                    if (checkLogic(itemContext)) {
                        return { isMatch: true };
                    }
                } catch (e: any) {
                    return { isMatch: false, error: `Row error: ${e.message || String(e)}` };
                }
            }

            return { isMatch: false };

        } catch (error: any) {
            return { isMatch: false, error: error.message || String(error) };
        }
    }

    private evaluateMath(expression: string, context: any): boolean {
        try {
            // Using raw expression without auto-fix
            let expr = expression;

            // Only expose specific safe keys and the context objects
            // We expose all keys in context for maximum flexibility
            // Inject Helpers
            const helpers = {
                Math: Math,
                Number: Number,
                parseFloat: parseFloat,
                parseInt: parseInt
            };

            const keys = [...Object.keys(context), ...Object.keys(helpers)];
            const values = [...Object.values(context), ...Object.values(helpers)];

            // Create function from expression
            // Replace '==' with '==='? No, loose equality is often desired in JS/XML data 
            // but strict == in JS is loose. 
            // Note: expression 'A == B' returns boolean. 

            const fn = new Function(...keys, `return ${expr};`);
            return !!fn(...values);
        } catch (e: any) {
            // console.error("Math Eval Failed:", e);
            throw new Error(`Lỗi biểu thức: ${e.message}`);
        }
    }

    private evaluateRuleCode(code: string, context: any, throwError = false): boolean {
        try {
            // Clean up code
            let cleanCode = code.trim();
            if (cleanCode.startsWith('DK_LOI') && cleanCode.includes('=')) {
                const firstEq = cleanCode.indexOf('=');
                if (cleanCode[firstEq + 1] !== '=') {
                    cleanCode = cleanCode.substring(firstEq + 1).trim();
                }
            }

            // 1. Handle LOGICAL OR (||)
            // Split by || but respect parentheses (naive implementation for now, assuming simple logic)
            if (cleanCode.includes('||')) {
                const parts = cleanCode.split('||');
                return parts.some(part => this.evaluateRuleCode(part, context, throwError));
            }

            // 2. Handle LOGICAL AND (&&)
            if (cleanCode.includes('&&')) {
                const parts = cleanCode.split('&&');
                // All parts must be true
                return parts.every(part => this.evaluateRuleCode(part, context, throwError));
            }

            // 3. Handle PARENTHESES (Basic support for wrapping single expression)
            if (cleanCode.startsWith('(') && cleanCode.endsWith(')')) {
                return this.evaluateRuleCode(cleanCode.substring(1, cleanCode.length - 1), context, throwError);
            }

            const getVal = (path: string) => {
                path = path.trim();
                // Handle String Literals
                if ((path.startsWith("'") && path.endsWith("'")) || (path.startsWith('"') && path.endsWith('"'))) {
                    return path.substring(1, path.length - 1);
                }
                // Handle Numbers
                if (!isNaN(Number(path)) && path !== '') {
                    return Number(path);
                }

                // Optimization: Check for direct property on context first
                if (path in context) {
                    let val = context[path];
                    if (val && typeof val === 'object' && val.__cdata !== undefined) return val.__cdata;
                    return val;
                }

                const parts = path.split('.');
                let current = context;
                for (const part of parts) {
                    if (current === undefined || current === null) return null;

                    if (current[part] !== undefined) {
                        current = current[part];
                    } else {
                        // Case-insensitive fallback
                        const keys = Object.keys(current);
                        const foundKey = keys.find(k => k.toLowerCase() === part.toLowerCase());
                        if (foundKey) {
                            current = current[foundKey];
                        } else {
                            return null;
                        }
                    }
                }
                if (current && typeof current === 'object' && current.__cdata !== undefined) {
                    return current.__cdata;
                }
                return current;
            };

            // 4. Comparison operations
            const ops = ['<=', '>=', '==', '!=', '===', '!==', '<', '>'];

            for (const op of ops) {
                const operatorIndex = cleanCode.indexOf(op);

                if (operatorIndex !== -1) {
                    const left = cleanCode.substring(0, operatorIndex).trim();
                    const right = cleanCode.substring(operatorIndex + op.length).trim();

                    // Special case for null/undefined checks
                    if (right === 'null' || right === 'undefined') {
                        const val = getVal(left);
                        if (op === '==' || op === '===') return val === null || val === undefined || val === '';
                        if (op === '!=' || op === '!==') return val !== null && val !== undefined && val !== '';
                    }

                    const valLeft = getVal(left);
                    const valRight = getVal(right);

                    // Skip comparison if either side is missing (unless checking for missing)
                    if (valLeft === null || valRight === null) return false;

                    switch (op) {
                        case '<': return valLeft < valRight;
                        case '>': return valLeft > valRight;
                        case '<=': return valLeft <= valRight;
                        case '>=': return valLeft >= valRight;
                        case '==':
                        case '===': return valLeft == valRight;
                        case '!=':
                        case '!==': return valLeft != valRight;
                    }

                    break;
                }
            }
            return false;
        } catch (e) {
            if (throwError) throw e;
            return false;
        }
    }
}

// Initial Default Rules (from screenshot)
export const DEFAULT_RULES: ValidationRule[] = [
    {
        id: '1',
        active: true,
        checkNotNull: false,
        type: 'Xuất toán',
        xmlType: 'XML3',
        name: 'Không có ngày kết quả',
        code: 'NGAY_KQ == null',
        errorMessage: 'Dịch vụ yêu cầu có kết quả nhưng chưa có ngày kết quả'
    },
    {
        id: '2',
        active: true,
        checkNotNull: false,
        type: 'Xuất toán',
        xmlType: 'XML3',
        field: 'NGAY_YL',
        name: 'Y lệnh trước khi vào viện',
        code: 'NGAY_YL < XML1.NGAY_VAO',
        errorMessage: 'Ngày y lệnh nhỏ hơn ngày vào viện'
    },
    {
        id: '3',
        active: true,
        checkNotNull: false,
        type: 'Xuất toán',
        xmlType: 'XML3',
        field: 'NGAY_TH_YL',
        name: 'Ngày thực hiện sau ngày kết quả',
        code: 'NGAY_TH_YL > XML3.NGAY_KQ',
        errorMessage: 'Ngày thực hiện lớn hơn ngày kết quả'
    },
    {
        id: '4',
        active: true,
        checkNotNull: false,
        type: 'Xuất toán',
        xmlType: 'XML3',
        field: 'NGAY_KQ',
        name: 'Ngày kết quả sau ngày ra viện',
        code: 'NGAY_KQ > XML1.NGAY_RA',
        errorMessage: 'Ngày kết quả lớn hơn ngày ra viện'
    },
    {
        id: '5',
        active: true,
        checkNotNull: false,
        type: 'Cảnh báo',
        xmlType: 'XML3',
        field: 'NGAY_TH_YL',
        name: 'Ngày thực hiện trước ngày y lệnh',
        code: 'NGAY_TH_YL < NGAY_YL',
        errorMessage: 'Ngày thực hiện nhỏ hơn ngày y lệnh'
    },
    {
        id: '6',
        active: true,
        checkNotNull: false,
        type: 'Xuất toán',
        xmlType: 'XML7',
        field: 'MA_TTDV',
        name: 'Thiếu mã tình trạng dịch vụ (Trạm y tế)',
        code: '(MA_TTDV == null || MA_TTDV == "") && XML1.MA_LOAI_KCB == "03"',
        errorMessage: 'Thiếu MA_TTDV đối với hồ sơ Trạm y tế (03)'
    }
];
