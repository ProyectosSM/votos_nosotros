const express = require('express');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos (como el logo) desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Simulación de Login básico seguro
app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
    // Credenciales de ejemplo (puedes cambiarlas)
    if (usuario === 'fiscal01' && password === '123456') {
        res.redirect('/app.html');
    } else {
        res.send(`<script>alert('Credenciales incorrectas'); window.location.href='/';</script>`);
    }
});

// Ruta principal para servir el login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

// 6. Validar contraseña de administrador para habilitar Votos Manuales
app.post('/api/validar-admin', async (req, res) => {
    try {
        const claveIngresada = (req.body.password || '').trim();

        const { data, error } = await supabase
            .from('usuarios')
            .select('password, rol');

        if (error) return res.status(500).json({ ok: false, error: error.message });

        // Busca cualquier usuario con rol 'admin' (sin importar mayúsculas) cuya clave coincida
        const esValida = data.some(u => 
            (u.rol || '').trim().toLowerCase() === 'admin' && 
            (u.password || '').trim() === claveIngresada
        );

        if (!esValida) {
            return res.status(401).json({ ok: false });
        }

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});
