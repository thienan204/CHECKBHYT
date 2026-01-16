
import { getXmlDataList } from '../src/lib/xml';

console.log("--- TEST SUITE ---");

// Case 1: Standard Naming (underscores)
const case1 = {
    type: 'XML9',
    data: {
        CHITIEU_DU_LIEU_GIAY_CHUNG_SINH: {
            DSACH_GIAY_CHUNG_SINH: {
                GIAY_CHUNG_SINH: [
                    { MA_LK: 'CASE1', NAME: 'Standard' }
                ]
            }
        }
    }
};

// Case 2: Compact Naming (DSACH_GIAYCHUNGSINH) - Matches Screenshot
const case2 = {
    type: 'XML9',
    data: {
        CHITIEU_DU_LIEU_GIAY_CHUNG_SINH: {
            DSACH_GIAYCHUNGSINH: {
                GIAY_CHUNG_SINH: [
                    { MA_LK: 'CASE2', NAME: 'Compact DSACH' }
                ]
            }
        }
    }
};

// Case 3: Super Compact (GIAYCHUNGSINH)
const case3 = {
    type: 'XML9',
    data: {
        CHITIEU_DU_LIEU_GIAY_CHUNG_SINH: {
            DSACH_GIAYCHUNGSINH: {
                GIAYCHUNGSINH: [
                    { MA_LK: 'CASE3', NAME: 'Super Compact' }
                ]
            }
        }
    }
};

function test(name, input) {
    console.log(`\nTesting: ${name}`);
    const result = getXmlDataList(input);
    console.log("Result length:", result.length);
    if (result.length > 0 && result[0].MA_LK) {
        console.log(`[PASS] Extracted: ${result[0].MA_LK}`);
    } else {
        console.log(`[FAIL] Raw result keys: ${Object.keys(result[0] || {})}`);
    }
}

test("Standard Case", case1);
test("Compact Case (Screenshot Match)", case2);
test("Super Compact Case", case3);
