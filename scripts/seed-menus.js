const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding menus...');

  // Group 1: Tổng quan
  const group1 = await prisma.menu.create({
    data: {
      title: 'TỔNG QUAN',
      order: 10,
    }
  });

  await prisma.menu.createMany({
    data: [
      { title: 'Trang chủ', path: '/', icon: 'DashboardOutlined', parentId: group1.id, order: 10, permissionCode: null },
      { title: 'Đọc dữ liệu Excel', path: '/doc-file-excel', icon: 'FileExcelOutlined', parentId: group1.id, order: 20, permissionCode: 'MENU_DOC_FILE_EXCEL' },
    ]
  });

  // Group 2: Chuyên đề (Specialized)
  const group2 = await prisma.menu.create({
    data: {
      title: 'CHUYÊN ĐỀ',
      order: 20,
      isSpecialGroup: 'SPECIALIZED_RULES'
    }
  });
  // We don't seed children for group2 because SidebarClient will load them dynamically

  // Group 3: Yêu cầu khoa phòng
  const group3 = await prisma.menu.create({
    data: {
      title: 'YÊU CẦU KHOA PHÒNG',
      order: 30,
    }
  });

  await prisma.menu.createMany({
    data: [
      { title: 'Yêu cầu khoa phòng', path: '/error-management/it-requests', icon: 'ReconciliationOutlined', parentId: group3.id, order: 10, permissionCode: 'MENU_ERROR_REQUESTS' },
      { title: 'Tạo Yêu Cầu', path: '/error-management/it-requests/create', icon: 'PlusOutlined', parentId: group3.id, order: 15, permissionCode: 'MENU_ERROR_REQUESTS' },
      { title: 'Lỗi Read XML', path: '/error-management/xml-errors', icon: 'ExceptionOutlined', parentId: group3.id, order: 20, permissionCode: 'MENU_XML_ERRORS' },
      { title: 'Quản lý CNTT', path: '/error-management/duty-roster', icon: 'DesktopOutlined', parentId: group3.id, order: 30, permissionCode: 'MENU_IT_DUTY' },
      { title: 'Báo cáo thống kê', path: '/error-management/report', icon: 'BarChartOutlined', parentId: group3.id, order: 40, permissionCode: 'MENU_IT_REPORT' },
      { title: 'Quản lý hình ảnh', path: '/error-management/images', icon: 'PictureOutlined', parentId: group3.id, order: 50, permissionCode: 'MENU_IMAGE_MANAGEMENT' },
    ]
  });

  // Group 4: Công cụ & Tiện ích
  const group4 = await prisma.menu.create({
    data: {
      title: 'CÔNG CỤ & TIỆN ÍCH',
      order: 40,
    }
  });

  await prisma.menu.createMany({
    data: [
      { title: 'Quy tắc XML', path: '/rules', icon: 'SettingOutlined', parentId: group4.id, order: 10, permissionCode: 'MENU_XML_RULES' },
      { title: 'Quy tắc Excel', path: '/excel-rules', icon: 'TableOutlined', parentId: group4.id, order: 20, permissionCode: 'MENU_EXCEL_RULES' },
      { title: 'Quy tắc chuyên đề', path: '/chuyen-de/quy-tac-chuyen-de', icon: 'ExperimentOutlined', parentId: group4.id, order: 30, permissionCode: 'MENU_SPECIALIZED_RULES' },
      { title: 'Quản lý Role', path: '/roles', icon: 'SafetyCertificateOutlined', parentId: group4.id, order: 40, permissionCode: null }, // Admins only usually
      { title: 'Quản lý Khoa', path: '/departments', icon: 'BankOutlined', parentId: group4.id, order: 50, permissionCode: 'MENU_DEPARTMENTS' },
      { title: 'Quản lý Nhân viên', path: '/staff', icon: 'TeamOutlined', parentId: group4.id, order: 60, permissionCode: 'MENU_STAFF' },
    ]
  });

  // Group 5: Quản lý Mẫu
  const group5 = await prisma.menu.create({
    data: {
      title: 'QUẢN LÝ MẪU',
      order: 50,
    }
  });

  await prisma.menu.createMany({
    data: [
      { title: 'Mẫu 01/DM', path: '/mau01-catalog', icon: 'FileTextOutlined', parentId: group5.id, order: 10, permissionCode: 'MENU_CATALOG_01' },
      { title: 'Mẫu 02', path: '/mau02-catalog', icon: 'FileTextOutlined', parentId: group5.id, order: 20, permissionCode: 'MENU_CATALOG_02' },
      { title: 'Mẫu 03', path: '/mau03-catalog', icon: 'FileTextOutlined', parentId: group5.id, order: 30, permissionCode: 'MENU_CATALOG_03' },
      { title: 'Mẫu 04', path: '/mau04-catalog', icon: 'FileTextOutlined', parentId: group5.id, order: 40, permissionCode: 'MENU_CATALOG_04' },
      { title: 'Mẫu 05', path: '/mau05-catalog', icon: 'FileTextOutlined', parentId: group5.id, order: 50, permissionCode: 'MENU_CATALOG_05' },
      { title: 'Mẫu 06', path: '/mau06-catalog', icon: 'FileTextOutlined', parentId: group5.id, order: 60, permissionCode: 'MENU_CATALOG_06' },
    ]
  });

  console.log('Seeding menus completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
