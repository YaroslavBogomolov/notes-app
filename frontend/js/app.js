class NotesApp {
    constructor() {
        this.API_BASE = window.location.origin.includes('localhost') 
            ? 'http://localhost:3000' 
            : window.location.origin;
        this.notes = [];
        this.init();
    }

    async init() {
        await this.checkApiStatus();
        await this.loadNotes();
        this.setupEventListeners();
    }

    async checkApiStatus() {
        const el = document.getElementById('api-status');
        try {
            const res = await fetch(`${this.API_BASE}/health`);
            if (res.ok) {
                el.textContent = 'Статус: ✅ API доступен';
                el.className = 'status connected';
            } else {
                throw new Error();
            }
        } catch {
            el.textContent = 'Статус: ❌ API недоступен';
            el.className = 'status error';
        }
    }

    async loadNotes() {
        try {
            const res = await fetch(`${this.API_BASE}/api/notes`);
            if (!res.ok) throw new Error();
            this.notes = await res.json();
            this.renderNotes();
        } catch {
            this.showNotification('Не удалось загрузить заметки', 'error');
        }
    }

    async addNote(title, content) {
        try {
            const res = await fetch(`${this.API_BASE}/api/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            if (!res.ok) throw new Error();
            const newNote = await res.json();
            this.notes.unshift(newNote);
            this.renderNotes();
            this.showNotification('Заметка добавлена', 'success');
            return true;
        } catch {
            this.showNotification('Ошибка при добавлении', 'error');
            return false;
        }
    }

    async deleteNote(id) {
        if (!confirm('Удалить заметку?')) return;
        try {
            const res = await fetch(`${this.API_BASE}/api/notes/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error();
            this.notes = this.notes.filter(n => n.id !== id);
            this.renderNotes();
            this.showNotification('Заметка удалена', 'success');
        } catch {
            this.showNotification('Ошибка при удалении', 'error');
        }
    }

    renderNotes() {
        const container = document.getElementById('notes-container');
        if (this.notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>Заметок пока нет</p>
                </div>
            `;
            return;
        }
        container.innerHTML = this.notes.map(note => `
            <div class="note" data-id="${note.id}">
                <h3>${this.escapeHtml(note.title)}</h3>
                ${note.content ? `<p>${this.escapeHtml(note.content)}</p>` : ''}
                <div class="note-meta">
                    ${new Date(note.created_at).toLocaleDateString('ru-RU')}
                </div>
                <div class="actions">
                    <button onclick="app.deleteNote(${note.id})" class="btn secondary">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        document.getElementById('note-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('title').value.trim();
            const content = document.getElementById('content').value.trim();
            if (!title) {
                this.showNotification('Введите заголовок', 'error');
                return;
            }
            const success = await this.addNote(title, content);
            if (success) {
                document.getElementById('note-form').reset();
            }
        });

        document.getElementById('refresh').addEventListener('click', () => this.loadNotes());
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

const app = new NotesApp();