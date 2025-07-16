const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');


const app = express();
app.use(express.json());


const DB_FILE = 'users.json';

function loadUsers() {
    if (!fs.existsSync(DB_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DB_FILE);
    return JSON.parse(data);
}

function saveUsers(users) {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

function validateInput(email, password, username) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return { valid: false, message: 'Invalid email format.' };
    }
    if (!password || password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters long.' };
    }
    if (!username) {
        return { valid: false, message: 'Username is required.' };
    }
    return { valid: true };
}

app.post('/register', async (req, res) => {
    const { email, password, username } = req.body;

    const validationError = validateInput(email, password, username);
    if (!validationError.valid) {
        return res.status(400).json({ error: validationError.message });
    }

    const users = loadUsers();
    if (users.some(user => user.email === email)) {
        return res.status(400).json({ error: 'Email already registered.' });
    }

    if(users.some(user => user.username === username)) {
        return res.status(400).json({ error: 'Username already taken.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
        id: uuidv4(),
        email,
        username,
        password: hashedPassword
    }

    users.push(user);
    saveUsers(users);
    res.status(201).json({ userId: user.id, message: 'User registered successfully.' });

})

app.listen(3000, () => console.log('Server is running on port 3000'));


