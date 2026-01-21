const { test, expect, _electron: electron } = require('@playwright/test');

test('End-to-end user workflow', async () => {
    // 1. Launch App
    // Đảm bảo đường dẫn '.' trỏ đúng thư mục chứa package.json/main.js
    const electronApp = await electron.launch({ args: ['.'] });

    // Lấy cửa sổ đầu tiên
    const window = await electronApp.firstWindow();

    // QUAN TRỌNG: Chờ ứng dụng tải xong nội dung HTML trước khi thao tác
    await window.waitForLoadState('domcontentloaded');

    const taskText = 'My new E2E test task';

    // --- Task 1: Add a new todo item ---

    // Tìm ô input. Nếu app bạn không dùng id="todo-input", hãy thử class hoặc placeholder
    // Ví dụ thay thế: window.getByPlaceholder('What needs to be done?')
    const inputField = window.locator('#todo-input');
    await inputField.fill(taskText);

    // SỬA LỖI Ở ĐÂY:
    // Thay vì tìm theo ID '#add-btn' (có thể không tồn tại), ta tìm nút có chứa chữ "Add" hoặc "Thêm"
    // .getByRole('button', ...) là cách tìm chuẩn nhất trong Playwright
    const addBtn = window.getByRole('button', { name: /Add|Thêm/i });

    // Nếu code trên vẫn lỗi, dùng phương án dự phòng tìm nút bất kỳ:
    // const addBtn = window.locator('button').first(); 

    await addBtn.click();


    // --- Task 2: Verify the todo item was added ---

    // Tìm item có chứa text vừa nhập
    const todoItem = window.locator('.todo-item').filter({ hasText: taskText });

    // Chờ một chút để UI kịp cập nhật (nếu cần)
    await expect(todoItem).toBeVisible({ timeout: 5000 });
    await expect(todoItem).toContainText(taskText);


    // --- Task 3: Mark the todo item as complete ---

    // Tìm checkbox bên trong todoItem đó
    const checkbox = todoItem.locator('input[type="checkbox"]');
    await checkbox.click();

    // Kiểm tra class completed (dùng regex để linh hoạt)
    // Đảm bảo CSS của bạn có class tên là 'completed' (hoặc 'done', 'checked' tùy code)
    await expect(todoItem).toHaveClass(/completed/);


    // --- Task 4: Delete the todo item ---

    // Tìm nút xóa bên trong todoItem. 
    // Nếu nút xóa không có class .delete-btn, hãy thử tìm theo text "Delete", "Xóa", hoặc "X"
    const deleteBtn = todoItem.locator('button', { hasText: /Delete|Xóa|X/i });

    // Hoặc nếu nút xóa là nút thứ 2 trong item:
    // const deleteBtn = todoItem.locator('button').last();

    await deleteBtn.click();

    // Kiểm tra đã biến mất
    await expect(todoItem).not.toBeVisible();

    // Close the app
    await electronApp.close();
});