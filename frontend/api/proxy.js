export default async function handler(req, res) {
  // Lấy URL backend thực tế từ biến môi trường
  const backendUrl = process.env.BACKEND_URL;
  
  if (!backendUrl) {
    return res.status(500).json({ 
      success: false, 
      message: "Lỗi Vercel: Chưa cài đặt biến môi trường BACKEND_URL trên Vercel" 
    });
  }

  // req.url sẽ có dạng /api/auth/login?param=1
  const targetUrl = new URL(req.url, backendUrl);

  const fetchOptions = {
    method: req.method,
    headers: { ...req.headers },
  };

  // Xóa các header không tương thích khi proxy
  delete fetchOptions.headers.host;
  delete fetchOptions.headers.origin;
  delete fetchOptions.headers.referer;

  // Thêm header để bypass trang cảnh báo của Ngrok (nếu dùng Ngrok)
  fetchOptions.headers['ngrok-skip-browser-warning'] = '69420';

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Vercel tự động parse JSON body, ta cần stringify lại để gửi đi
    if (req.body && typeof req.body === 'object') {
      fetchOptions.body = JSON.stringify(req.body);
    } else {
      fetchOptions.body = req.body;
    }
  }

  try {
    const response = await fetch(targetUrl.toString(), fetchOptions);
    const body = await response.text();

    // Copy lại headers từ backend về cho frontend
    for (const [key, value] of response.headers) {
      // Bỏ qua các header CORS vì Vercel và Frontend giờ đã "cùng một nhà" (Same-origin)
      if (key.toLowerCase().startsWith('access-control-')) continue;
      if (key.toLowerCase() === 'transfer-encoding') continue;
      res.setHeader(key, value);
    }

    res.status(response.status).send(body);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Lỗi Vercel Proxy kết nối đến Backend: " + error.message 
    });
  }
}
