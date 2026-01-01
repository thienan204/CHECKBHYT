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
    conditionField?: string; // Optional: Field to check condition on
    conditionValue?: string; // Optional: Comma-separated values for the condition field
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
                    let context = { ...rootContext };
                    // XML1 is already unwrapped in rootContext creation above

                    if (this.evaluateRuleCode(rule.code, context)) {
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

                            if (this.evaluateRuleCode(rule.code, extendedContext)) {
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

    private evaluateRuleCode(code: string, context: any): boolean {
        // Basic evaluation logic. 
        try {
            // Strip legacy assignment syntax (e.g. "DK_LOI = ...")
            if (code.includes('=')) {
                const parts = code.split('=');
                // If the first part looks like a variable name and the rest is an expression
                // But wait, "==" is also an operator. 
                // We should only strip if it's a single "=" and at the start.
                // Simple heuristic: if code starts with "DK_LOI =", remove it.
                if (code.trim().startsWith('DK_LOI') && code.includes('=')) {
                    // Find the first '=' and take everything after it
                    const firstEq = code.indexOf('=');
                    // Check if it's "==" (comparison) or "=" (assignment)
                    // If the char after '=' is NOT '=', it's assignment
                    if (code[firstEq + 1] !== '=') {
                        code = code.substring(firstEq + 1).trim();
                    }
                }
            }

            const getVal = (path: string) => {
                // Optimization: Check for direct property on context first (implicit access)
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

            // Enhanced logic parser
            // 1. Comparison operations
            // Order matters: match longer operators first to avoid partial matches (e.g., '<=' matching '<')
            const ops = ['<=', '>=', '==', '!=', '===', '!==', '<', '>'];

            for (const op of ops) {
                const operatorIndex = code.indexOf(op);

                if (operatorIndex !== -1) {
                    const left = code.substring(0, operatorIndex).trim();
                    const right = code.substring(operatorIndex + op.length).trim();

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
            return false;
        }
    }
}

// Initial Default Rules (from screenshot)
export const DEFAULT_RULES: ValidationRule[] = [
    {
        id: '1',
        active: true,
        type: 'Xuất toán',
        xmlType: 'XML3',
        name: 'Không có ngày kết quả',
        // Code simplifies to direct field access since we iterate rows
        code: 'NGAY_KQ == null'
    },
    {
        id: '1b',
        active: true,
        type: 'Xuất toán',
        xmlType: 'XML3',
        name: 'Không có ngày kết quả (Full Path)',
        // Keep old style valid too if possible, but simpler is better
        code: 'XML3.NGAY_KQ == null'
    },
    {
        id: '2',
        active: true,
        type: 'Xuất toán',
        xmlType: 'XML3',
        field: 'NGAY_YL',
        name: 'Y lệnh trước khi vào viện',
        code: 'NGAY_YL < XML1.NGAY_VAO'
    }
];
