import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const newRecord = await prisma.mau03Catalog.create({
        data: {
            STT: null,
            MA_THUOC: 'test',
            TEN_HOAT_CHAT: 'test',
            TEN_THUOC: 'test',
            DON_VI_TINH: 'test',
            HAM_LUONG: 'test',
            DUONG_DUNG: 'test',
            MA_DUONG_DUNG: 'test',
            DANG_BAO_CHE: 'test',
            SO_DANG_KY: 'test',
            SO_LUONG: 1,
            DON_GIA: 1,
            DON_GIA_BH: 1,
            QUY_CACH: 'test',
            NHA_SX: 'test',
            NUOC_SX: 'test',
            NHA_THAU: 'test',
            TT_THAU: 'test',
            TU_NGAY_HD: 'test',
            DEN_NGAY_HD: 'test',
            MA_CSKCB: 'test',
            LOAI_THUOC: 1,
            LOAI_THAU: 1,
            HT_THAU: 1,
            MA_DVKT: 'test',
            TCCL: 'test',
            BO_PHAN_VT: 1,
            TEN_KHOA_HOC: 'test',
            NGUON_GOC: 'test',
            PP_CHEBIEN: 'test',
            MA_DL_NHAP: 'test',
            MA_DL_CB: 'test',
            TLHH_CB: 1,
            TLHH_BQ: 1,
            MA_CSKCB_THUOC: 'test',
            TU_NGAY: 'test',
            DEN_NGAY: 'test',
        }
    });
    console.log("Success", newRecord);
  } catch(e) {
    console.error("Error creating record:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
