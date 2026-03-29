// Cấu hình Firebase
// LƯU Ý: Thay thế các thông tin dưới đây bằng thông tin từ dự án Firebase của bạn
// Hướng dẫn: https://firebase.google.com/docs/web/setup
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Khởi tạo Firebase nếu có cấu hình thực tế
let app, auth, db;
try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        console.log("Firebase đã khởi tạo");
    } else {
        console.warn("Chưa cấu hình Firebase! Đăng nhập Google/Facebook và lưu Database sẽ ở chế độ thử nghiệm (Local).");
    }
} catch(e) {
    console.error("Lỗi khởi tạo Firebase: ", e);
}
