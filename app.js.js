import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, limit, query } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ⚠️ GANTIKAN KOD DI BAWAH DENGAN CONFIG PROJEK FIREBASE ANDA
const firebaseConfig = {
    apiKey: "AIzaSyAxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "aplikasi-nilam.firebaseapp.com",
    projectId: "aplikasi-nilam",
    storageBucket: "aplikasi-nilam.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:12345:web:abcd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Elemen HTML
const storyTitleHtml = document.getElementById('story-title');
const storyContentHtml = document.getElementById('story-content');
const storyMoralHtml = document.getElementById('story-moral');
const bookTitleInput = document.getElementById('bookTitle');
const nilamForm = document.getElementById('nilamForm');

// 1. FUNGSI: Ambil Cerita dari Firebase Firestore
async function muatTurunCerita() {
    try {
        const q = query(collection(db, "stories"), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                storyTitleHtml.innerText = data.title;
                storyContentHtml.innerText = data.content;
                storyMoralHtml.innerText = `Nilai Murni: ${data.moral_value}`;
                
                // Masukkan tajuk cerita ke dalam borang NILAM secara automatik
                bookTitleInput.value = data.title;
            });
        } else {
            // Jika database kosong, letak cerita default
            storyTitleHtml.innerText = "Misteri Pemadam Hilang";
            storyContentHtml.innerText = "Pada suatu hari di dalam kelas Tahun 1, Rahman mendapati pemadamnya telah hilang. Dia tidak menuduh sesiapa sebaliknya bertanya dengan sopan. Akhirnya, Rahim memulangkan pemadam itu dan meminta maaf kerana tersilap ambil. Rahman memaafkannya.";
            storyMoralHtml.innerText = "Nilai Murni: Kejujuran dan Saling Memaafkan";
            bookTitleInput.value = "Misteri Pemadam Hilang";
        }
    } catch (error) {
        console.error("Ralat memuatkan cerita: ", error);
    }
}

// 2. FUNGSI: Simpan Data NILAM Murid ke Firebase
nilamForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const studentName = document.getElementById('studentName').value;
    const studentClass = document.getElementById('studentClass').value;
    const bookTitle = bookTitleInput.value;
    const synopsis = document.getElementById('synopsis').value;

    try {
        await addDoc(collection(db, "nilam_records"), {
            student_name: studentName,
            class: studentClass,
            book_title: bookTitle,
            synopsis: synopsis,
            date_read: new Date().toISOString()
        });

        alert("🎉 Syabas! Rekod NILAM anda telah berjaya disimpan.");
        nilamForm.reset();
        muatTurunCerita(); // Muat cerita baru jika ada
    } catch (e) {
        alert("Aduhai, ada ralat berlaku. Sila cuba lagi.");
        console.error("Ralat menyimpan dokumen: ", e);
    }
});

// Jalankan fungsi apabila halaman dibuka
muatTurunCerita();