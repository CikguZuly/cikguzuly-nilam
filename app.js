import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, limit, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ⚠️ PASTIKAN CONFIG FIREBASE ANDA DI SINI BETUL
const firebaseConfig = {
    apiKey: "AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "aplikasi-nilam.firebaseapp.com",
    projectId: "aplikasi-nilam",
    storageBucket: "aplikasi-nilam.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:12345:web:abcd"
};

// Initialize Firebase & Perkhidmatan
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Elemen Antaramuka (Screens)
const loginScreen = document.getElementById('login-screen');
const studentScreen = document.getElementById('student-screen');
const adminScreen = document.getElementById('admin-screen');

// Mengurus Status Log Masuk Pengguna Secara Automatik
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Semak sama ada pengguna ialah admin (berdasarkan e-mel admin yang kita tetapkan)
        if (user.email === "skusadmin@mail.com") {
            bukaPaparanAdmin();
        } else {
            bukaPaparanMurid(user);
        }
    } else {
        // Jika tiada sesiapa log masuk, tunjuk skrin login semula
        loginScreen.classList.remove('hidden');
        studentScreen.classList.add('hidden');
        adminScreen.classList.add('hidden');
    }
});

// ==========================================
// LOGIK LOG MASUK (LOGIN LOGIC)
// ==========================================

// 1. Murid Log Masuk Menggunakan Google
document.getElementById('btn-google-login').addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        alert("Gagal log masuk dengan Google: " + error.message);
    }
});

// 2. Admin Log Masuk Menggunakan ID & Kata Laluan
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const idInput = document.getElementById('adminUsername').value; // SKUSADMIN
    const passwordInput = document.getElementById('adminPassword').value; // BBA4021

    // Tukar ID biasa kepada format e-mel yang kita daftarkan di Firebase
    if (idInput.toUpperCase() === "SKUSADMIN") {
        const emailFormat = "skusadmin@mail.com";
        try {
            await signInWithEmailAndPassword(auth, emailFormat, passwordInput);
            document.getElementById('adminLoginForm').reset();
        } catch (error) {
            alert("Kata laluan Admin salah!");
        }
    } else {
        alert("ID Admin tidak wujud!");
    }
});

// Fungsi Keluar Akaun (Logout)
document.getElementById('btn-logout-student').addEventListener('click', () => signOut(auth));
document.getElementById('btn-logout-admin').addEventListener('click', () => signOut(auth));


// ==========================================
// APALIKASI MURID (STUDENT APP FUNCTIONS)
// ==========================================
async function bukaPaparanMurid(user) {
    loginScreen.classList.add('hidden');
    studentScreen.classList.remove('hidden');
    document.getElementById('user-display-name').innerText = `Murid: ${user.displayName} (${user.email})`;
    
    // Muat cerita
    muatTurunCerita();
}

async function muatTurunCerita() {
    try {
        const q = query(collection(db, "stories"), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                document.getElementById('story-title').innerText = data.title;
                document.getElementById('story-content').innerText = data.content;
                document.getElementById('story-moral').innerText = `Nilai Murni: ${data.moral_value}`;
                document.getElementById('bookTitle').value = data.title;
            });
        } else {
            // Laluan default jika tiada cerita dalam DB
            document.getElementById('story-title').innerText = "Misteri Pemadam Hilang";
            document.getElementById('story-content').innerText = "Pada suatu hari di dalam kelas Tahun 1, Rahman mendapati pemadamnya telah hilang...";
            document.getElementById('story-moral').innerText = "Nilai Murni: Kejujuran";
            document.getElementById('bookTitle').value = "Misteri Pemadam Hilang";
        }
    } catch (error) {
        console.error(error);
    }
}

// Hantar Data NILAM Murid
document.getElementById('nilamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;

    try {
        await addDoc(collection(db, "nilam_records"), {
            student_name: currentUser.displayName,
            student_email: currentUser.email,
            class: document.getElementById('studentClass').value,
            book_title: document.getElementById('bookTitle').value,
            synopsis: document.getElementById('synopsis').value,
            date_read: new Date().toLocaleDateString('ms-MY')
        });

        alert("🎉 Syabas! Rekod NILAM anda telah berjaya disimpan.");
        document.getElementById('nilamForm').reset();
    } catch (e) {
        alert("Ralat menyimpan data.");
    }
});


// ==========================================
// DASHBOARD ADMIN (ADMIN FUNCTIONS)
// ==========================================
async function bukaPaparanAdmin() {
    loginScreen.classList.add('hidden');
    adminScreen.classList.remove('hidden');
    
    const tableBody = document.getElementById('admin-table-body');
    tableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center">Memuatkan data murid...</td></tr>`;

    try {
        // Ambil semua data rekod NILAM disusun mengikut tarikh terkini
        const q = query(collection(db, "nilam_records"), orderBy("date_read", "desc"));
        const querySnapshot = await getDocs(q);
        
        let htmlKandungan = "";
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                htmlKandungan += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="p-3 border font-semibold">${data.student_name || 'Tiada Nama'}</td>
                        <td class="p-3 border text-xs text-gray-500">${data.student_email || '-'}</td>
                        <td class="p-3 border">${data.class}</td>
                        <td class="p-3 border italic font-medium text-blue-600">${data.book_title}</td>
                        <td class="p-3 border max-w-xs truncate" title="${data.synopsis}">${data.synopsis}</td>
                        <td class="p-3 border text-xs">${data.date_read}</td>
                    </tr>
                `;
            });
            tableBody.innerHTML = htmlKandungan;
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-400">Belum ada sebarang rekod NILAM dihantar oleh murid.</td></tr>`;
        }
    } catch (error) {
        console.error("Ralat admin: ", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-500">Ralat memuatkan rekod. Sila pastikan "Index" Firestore telah siap diproses jika diperlukan.</td></tr>`;
    }
}
