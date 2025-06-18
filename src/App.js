/*
================================================================================
ARQUIVO ÚNICO: App.js (para um projeto React)
Este é o único ficheiro de código de que vai precisar.
Ele contém toda a lógica da sua aplicação web.
================================================================================
*/
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

// =======================================================================
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCTQyGQ592RvXPVLzKa8Ss8jsJyG6iYwAA",
  authDomain: "organizaja-48b87.firebaseapp.com",
  projectId: "organizaja-48b87",
  storageBucket: "organizaja-48b87.firebasestorage.app",
  messagingSenderId: "679108054222",
  appId: "1:679108054222:web:a7fc579e51c14065de949f",
  measurementId: "G-6KN7TBFTPD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// =======================================================================

// Inicialização dos serviços do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Componente de Autenticação ---
function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuthAction = () => {
        setLoading(true);
        setError('');
        const authAction = isLogin
            ? signInWithEmailAndPassword(auth, email, password)
            : createUserWithEmailAndPassword(auth, email, password);

        authAction
            .catch(err => setError('Email ou palavra-passe incorretos.'))
            .finally(() => setLoading(false));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#1A1A2E', fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: '#E94560', marginBottom: '10px' }}>OrganizaJá</h1>
            <h2 style={{ fontSize: '18px', color: '#B8C1EC', marginBottom: '30px', fontWeight: 'normal' }}>{isLogin ? 'Aceda à sua conta' : 'Crie a sua conta'}</h2>
            <input style={{ backgroundColor: '#1F4068', color: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '15px', fontSize: '16px', border: 'none', width: '300px' }} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input style={{ backgroundColor: '#1F4068', color: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '15px', fontSize: '16px', border: 'none', width: '300px' }} type="password" placeholder="Palavra-passe" value={password} onChange={e => setPassword(e.target.value)} />
            {error && <p style={{ color: '#e74c3c', textAlign: 'center', marginBottom: '10px' }}>{error}</p>}
            <button style={{ backgroundColor: '#E94560', padding: '15px', borderRadius: '10px', width: '330px', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }} onClick={handleAuthAction} disabled={loading}>
                {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Registar')}
            </button>
            <p style={{ color: '#B8C1EC', textAlign: 'center', fontSize: '14px', marginTop: '20px', cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Não tem uma conta? Registe-se' : 'Já tem uma conta? Entre'}
            </p>
        </div>
    );
}

// --- Componente do Dashboard ---
function DashboardScreen({ user }) {
    const [transactions, setTransactions] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const q = query(collection(db, `users/${user.uid}/transactions`), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, snapshot => {
            setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    const handleAddTransaction = () => {
        if (!description || !amount) return;
        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numericAmount)) return;

        addDoc(collection(db, `users/${user.uid}/transactions`), {
            description,
            amount: numericAmount,
            createdAt: new Date(),
        });
        setDescription('');
        setAmount('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#162447', fontFamily: 'Inter, sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#1A1A2E' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: 0 }}>O meu Dashboard</h1>
                <p style={{ color: '#E94560', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', margin: 0 }} onClick={() => signOut(auth)}>Sair</p>
            </header>
            <main style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {loading
                    ? <p>A carregar transações...</p>
                    : transactions.map(t => (
                        <div key={t.id} style={{ backgroundColor: '#1F4068', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ color: '#fff', fontSize: '16px' }}>{t.description}</span>
                            <span style={{ fontSize: '16px', fontWeight: 'bold', color: t.amount >= 0 ? '#2ecc71' : '#e74c3c' }}>
                                {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    ))}
                 {transactions.length === 0 && !loading && <p>Nenhuma transação ainda. Adicione uma abaixo!</p>}
            </main>
            <footer style={{ display: 'flex', padding: '20px', borderTop: '1px solid #1A1A2E', gap: '10px' }}>
                <input style={{ flex: 1, backgroundColor: '#1F4068', color: '#fff', padding: '15px', borderRadius: '10px', border: 'none' }} placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} />
                <input style={{ flex: '0.5', backgroundColor: '#1F4068', color: '#fff', padding: '15px', borderRadius: '10px', border: 'none' }} placeholder="Valor" value={amount} onChange={e => setAmount(e.target.value)} />
                <button style={{ backgroundColor: '#E94560', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '24px', borderRadius: '10px', width: '50px', cursor: 'pointer' }} onClick={handleAddTransaction}>+</button>
            </footer>
        </div>
    );
}

// --- Componente Principal ---
function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Adiciona a fonte do Google ao cabeçalho do documento
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }, []);

    if (loading) {
        return <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A2E', color: 'white', fontFamily: 'Inter, sans-serif'}}>A carregar aplicação...</div>;
    }

    return user ? <DashboardScreen user={user} /> : <AuthScreen />;
}

// Em vez de 'export default App', usamos o ReactDOM diretamente,
// pois no guia estamos a usar um método sem 'create-react-app' para simplificar.
// Se estivéssemos a usar 'create-react-app', o ficheiro src/index.js trataria disto.
// Mas para o nosso método simplificado no GitHub, esta abordagem não funcionará.
// O código correto para um ambiente com 'create-react-app' (como o do guia) seria:
export default App;
