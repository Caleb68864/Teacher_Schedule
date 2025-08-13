// Database management using sql.js for browser-based SQLite
class ScheduleDatabase {
    constructor() {
        this.db = null;
        this.SQL = null;
    }

    async init() {
        // Load sql.js
        this.SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });

        // Try to load existing database from localStorage
        const savedDb = localStorage.getItem('scheduleDb');
        if (savedDb) {
            const buf = this.base64ToArrayBuffer(savedDb);
            this.db = new this.SQL.Database(new Uint8Array(buf));
        } else {
            // Create new database
            this.db = new this.SQL.Database();
            this.createTables();
            this.insertDefaultData();
        }
    }

    createTables() {
        // Create schedule table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                time_start TEXT NOT NULL,
                time_end TEXT NOT NULL,
                subject TEXT NOT NULL,
                grade TEXT,
                type TEXT DEFAULT 'normal',
                icon TEXT DEFAULT 'fa-clock',
                color TEXT DEFAULT '#3b82f6',
                note TEXT,
                day_of_week TEXT DEFAULT 'all',
                sort_order INTEGER DEFAULT 0
            )
        `);

        // Create students table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS students (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )
        `);

        // Create teachers table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS teachers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                email TEXT,
                phone TEXT
            )
        `);

        // Create schedule_students junction table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS schedule_students (
                schedule_id INTEGER,
                student_id INTEGER,
                FOREIGN KEY (schedule_id) REFERENCES schedule(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                PRIMARY KEY (schedule_id, student_id)
            )
        `);

        // Create schedule_teachers junction table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS schedule_teachers (
                schedule_id INTEGER,
                teacher_id INTEGER,
                FOREIGN KEY (schedule_id) REFERENCES schedule(id) ON DELETE CASCADE,
                FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
                PRIMARY KEY (schedule_id, teacher_id)
            )
        `);

        // Create theme settings table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS theme_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                title TEXT DEFAULT 'Mrs. Bennett''s Dragon Schedule',
                subtitle TEXT DEFAULT '2025-2026 Academic Year',
                background TEXT DEFAULT 'linear-gradient(135deg, #84cc16 0%, #eab308 100%)',
                header_text_color TEXT DEFAULT '#ffffff',
                header_text_shadow TEXT DEFAULT '2px 2px 4px rgba(0,0,0,0.3)',
                primary_button_color TEXT DEFAULT 'linear-gradient(135deg, #16a34a 0%, #84cc16 100%)',
                controls_background TEXT DEFAULT '#fef3c7',
                controls_text_color TEXT DEFAULT '#365314'
            )
        `);

        // Create PDF settings table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS pdf_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                time_font_size REAL DEFAULT 7,
                grade_font_size REAL DEFAULT 7,
                subject_font_size REAL DEFAULT 10,
                subject_line2_font_size REAL DEFAULT 9,
                student_font_size REAL DEFAULT 7.5,
                teacher_font_size REAL DEFAULT 7.5,
                note_font_size REAL DEFAULT 7,
                columns_per_page INTEGER DEFAULT 4,
                rows_per_page INTEGER DEFAULT 4,
                padding_before_subject REAL DEFAULT 10,
                padding_after_subject REAL DEFAULT 6,
                padding_after_students REAL DEFAULT 2,
                padding_after_teachers REAL DEFAULT 5,
                padding_before_note REAL DEFAULT 2
            )
        `);
    }

    insertDefaultData() {
        // Insert default theme
        this.db.run(`
            INSERT OR IGNORE INTO theme_settings (id) VALUES (1)
        `);

        // Insert default PDF settings
        this.db.run(`
            INSERT OR IGNORE INTO pdf_settings (id) VALUES (1)
        `);

        // Insert default students
        const students = [
            'Nya', 'Christian', 'Ziler', 'Mohamed', 'Delilah', 'Layla', 'Nico',
            'Peter', 'Yaxi', 'Rihanna', 'Toby', 'Brazik', 'Dominga', 'Samuel',
            'Jake', 'Matthew', 'Ian', 'PLC-4th Grade'
        ];
        
        students.forEach(name => {
            this.db.run(`INSERT OR IGNORE INTO students (name) VALUES (?)`, [name]);
        });

        // Insert default schedule
        const scheduleData = [
            { time_start: '08:00', time_end: '08:10', subject: 'Check-in', students: ['Nya'], grade: '', type: 'normal', icon: 'fa-clipboard-check', color: '#667eea', note: '', sort_order: 1 },
            { time_start: '08:10', time_end: '08:40', subject: 'ELA and check-ins', students: ['Christian', 'Ziler'], grade: '5th', type: 'normal', icon: 'fa-book-open', color: '#10b981', note: '', sort_order: 2 },
            { time_start: '08:40', time_end: '09:10', subject: 'Math - Connecting Math', students: ['Christian', 'Ziler'], grade: '5th', type: 'normal', icon: 'fa-calculator', color: '#3b82f6', note: '', sort_order: 3 },
            { time_start: '09:10', time_end: '09:35', subject: 'ULS', students: ['Mohamed'], grade: '4th', type: 'normal', icon: 'fa-graduation-cap', color: '#8b5cf6', note: '', sort_order: 4 },
            { time_start: '09:35', time_end: '09:50', subject: 'Zones of Regulation', students: ['Delilah', 'Layla', 'Nico'], grade: '3rd', type: 'special', icon: 'fa-brain', color: '#ec4899', note: '', sort_order: 5 },
            { time_start: '10:00', time_end: '10:50', subject: 'Planning Time', students: ['PLC-4th Grade'], grade: '', type: 'break', icon: 'fa-clock', color: '#f59e0b', note: '', sort_order: 6 },
            { time_start: '10:50', time_end: '11:20', subject: 'Lunch', students: [], grade: '', type: 'break', icon: 'fa-utensils', color: '#f59e0b', note: '', sort_order: 7 },
            { time_start: '11:30', time_end: '11:45', subject: 'Social Thinking and Me', students: ['Christian', 'Nya'], grade: '', type: 'special', icon: 'fa-users', color: '#ec4899', note: 'Tuesdays and Thursdays only', sort_order: 8 },
            { time_start: '11:50', time_end: '12:15', subject: 'CKLA', students: ['Peter'], grade: '3rd', type: 'normal', icon: 'fa-book', color: '#10b981', note: 'Bennett will go to room 310', sort_order: 9 },
            { time_start: '12:15', time_end: '12:45', subject: 'Connecting Math', students: ['Mohamed'], grade: '4th', type: 'normal', icon: 'fa-square-root-alt', color: '#3b82f6', note: '', sort_order: 10 },
            { time_start: '12:55', time_end: '13:40', subject: 'Writing/Story/Craft', students: ['Yaxi', 'Rihanna'], grade: '2nd & 5th', type: 'normal', icon: 'fa-pen-fancy', color: '#10b981', note: '', sort_order: 11 },
            { time_start: '13:45', time_end: '14:30', subject: 'ELA', students: ['Toby', 'Brazik', 'Dominga', 'Samuel', 'Jake'], grade: '4th', type: 'normal', icon: 'fa-spell-check', color: '#10b981', note: '', sort_order: 12 },
            { time_start: '14:30', time_end: '15:00', subject: 'Math', students: ['Matthew', 'Toby', 'Ian'], grade: '4th', type: 'normal', icon: 'fa-divide', color: '#3b82f6', note: '', sort_order: 13 }
        ];

        scheduleData.forEach(slot => {
            // Insert schedule entry
            const result = this.db.run(`
                INSERT INTO schedule (time_start, time_end, subject, grade, type, icon, color, note, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [slot.time_start, slot.time_end, slot.subject, slot.grade, slot.type, slot.icon, slot.color, slot.note, slot.sort_order]);
            
            const scheduleId = this.db.exec("SELECT last_insert_rowid()")[0].values[0][0];
            
            // Link students
            slot.students.forEach(studentName => {
                const studentResult = this.db.exec(`SELECT id FROM students WHERE name = ?`, [studentName]);
                if (studentResult.length > 0) {
                    const studentId = studentResult[0].values[0][0];
                    this.db.run(`
                        INSERT INTO schedule_students (schedule_id, student_id)
                        VALUES (?, ?)
                    `, [scheduleId, studentId]);
                }
            });
        });

        this.save();
    }

    save() {
        // Save database to localStorage
        const data = this.db.export();
        const base64 = btoa(String.fromCharCode.apply(null, data));
        localStorage.setItem('scheduleDb', base64);
    }

    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    getSchedule() {
        const result = this.db.exec(`
            SELECT 
                s.id,
                s.time_start,
                s.time_end,
                s.subject,
                s.grade,
                s.type,
                s.icon,
                s.color,
                s.note,
                s.sort_order,
                s.day_of_week,
                GROUP_CONCAT(DISTINCT st.name) as students,
                GROUP_CONCAT(DISTINCT t.name) as teachers
            FROM schedule s
            LEFT JOIN schedule_students ss ON s.id = ss.schedule_id
            LEFT JOIN students st ON ss.student_id = st.id
            LEFT JOIN schedule_teachers sct ON s.id = sct.schedule_id
            LEFT JOIN teachers t ON sct.teacher_id = t.id
            GROUP BY s.id
            ORDER BY s.sort_order, s.time_start
        `);

        if (result.length === 0) return [];

        const columns = result[0].columns;
        const values = result[0].values;

        return values.map(row => {
            const obj = {};
            columns.forEach((col, i) => {
                if (col === 'students' || col === 'teachers') {
                    obj[col] = row[i] ? row[i].split(',') : [];
                } else {
                    obj[col] = row[i];
                }
            });
            obj.time = `${obj.time_start}-${obj.time_end}`;
            return obj;
        });
    }

    getScheduleEntry(id) {
        const result = this.db.exec(`
            SELECT 
                s.*,
                GROUP_CONCAT(DISTINCT st.name) as students,
                GROUP_CONCAT(DISTINCT t.name) as teachers
            FROM schedule s
            LEFT JOIN schedule_students ss ON s.id = ss.schedule_id
            LEFT JOIN students st ON ss.student_id = st.id
            LEFT JOIN schedule_teachers sct ON s.id = sct.schedule_id
            LEFT JOIN teachers t ON sct.teacher_id = t.id
            WHERE s.id = ?
            GROUP BY s.id
        `, [id]);

        if (result.length === 0) return null;

        const columns = result[0].columns;
        const row = result[0].values[0];
        const obj = {};
        
        columns.forEach((col, i) => {
            if (col === 'students' || col === 'teachers') {
                obj[col] = row[i] ? row[i].split(',') : [];
            } else {
                obj[col] = row[i];
            }
        });
        
        return obj;
    }

    addScheduleEntry(entry) {
        const result = this.db.run(`
            INSERT INTO schedule (time_start, time_end, subject, grade, type, icon, color, note, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            entry.time_start,
            entry.time_end,
            entry.subject,
            entry.grade || '',
            entry.type || 'normal',
            entry.icon || 'fa-clock',
            entry.color || '#3b82f6',
            entry.note || '',
            entry.sort_order || 999
        ]);

        const scheduleId = this.db.exec("SELECT last_insert_rowid()")[0].values[0][0];

        // Add student associations
        if (entry.students && entry.students.length > 0) {
            entry.students.forEach(studentName => {
                // First ensure student exists
                this.db.run(`INSERT OR IGNORE INTO students (name) VALUES (?)`, [studentName]);
                
                // Get student ID
                const studentResult = this.db.exec(`SELECT id FROM students WHERE name = ?`, [studentName]);
                if (studentResult.length > 0) {
                    const studentId = studentResult[0].values[0][0];
                    this.db.run(`
                        INSERT INTO schedule_students (schedule_id, student_id)
                        VALUES (?, ?)
                    `, [scheduleId, studentId]);
                }
            });
        }

        // Add teacher associations
        if (entry.teachers && entry.teachers.length > 0) {
            entry.teachers.forEach(teacherName => {
                // Get teacher ID
                const teacherResult = this.db.exec(`SELECT id FROM teachers WHERE name = ?`, [teacherName]);
                if (teacherResult.length > 0) {
                    const teacherId = teacherResult[0].values[0][0];
                    this.db.run(`
                        INSERT INTO schedule_teachers (schedule_id, teacher_id)
                        VALUES (?, ?)
                    `, [scheduleId, teacherId]);
                }
            });
        }

        this.save();
        return scheduleId;
    }

    updateScheduleEntry(id, entry) {
        // Update main schedule entry
        this.db.run(`
            UPDATE schedule 
            SET time_start = ?, time_end = ?, subject = ?, grade = ?, 
                type = ?, icon = ?, color = ?, note = ?, sort_order = ?
            WHERE id = ?
        `, [
            entry.time_start,
            entry.time_end,
            entry.subject,
            entry.grade || '',
            entry.type || 'normal',
            entry.icon || 'fa-clock',
            entry.color || '#3b82f6',
            entry.note || '',
            entry.sort_order || 999,
            id
        ]);

        // Clear existing student associations
        this.db.run(`DELETE FROM schedule_students WHERE schedule_id = ?`, [id]);

        // Add new student associations
        if (entry.students && entry.students.length > 0) {
            entry.students.forEach(studentName => {
                // First ensure student exists
                this.db.run(`INSERT OR IGNORE INTO students (name) VALUES (?)`, [studentName]);
                
                // Get student ID
                const studentResult = this.db.exec(`SELECT id FROM students WHERE name = ?`, [studentName]);
                if (studentResult.length > 0) {
                    const studentId = studentResult[0].values[0][0];
                    this.db.run(`
                        INSERT INTO schedule_students (schedule_id, student_id)
                        VALUES (?, ?)
                    `, [id, studentId]);
                }
            });
        }

        // Clear existing teacher associations
        this.db.run(`DELETE FROM schedule_teachers WHERE schedule_id = ?`, [id]);

        // Add new teacher associations
        if (entry.teachers && entry.teachers.length > 0) {
            entry.teachers.forEach(teacherName => {
                // Get teacher ID
                const teacherResult = this.db.exec(`SELECT id FROM teachers WHERE name = ?`, [teacherName]);
                if (teacherResult.length > 0) {
                    const teacherId = teacherResult[0].values[0][0];
                    this.db.run(`
                        INSERT INTO schedule_teachers (schedule_id, teacher_id)
                        VALUES (?, ?)
                    `, [id, teacherId]);
                }
            });
        }

        this.save();
    }

    deleteScheduleEntry(id) {
        this.db.run(`DELETE FROM schedule WHERE id = ?`, [id]);
        this.save();
    }

    getAllStudents() {
        const result = this.db.exec(`SELECT name FROM students ORDER BY name`);
        if (result.length === 0) return [];
        return result[0].values.map(row => row[0]);
    }

    getAllTeachers() {
        const result = this.db.exec(`SELECT id, name, email, phone FROM teachers ORDER BY name`);
        if (result.length === 0) return [];
        return result[0].values.map(row => ({
            id: row[0],
            name: row[1],
            email: row[2],
            phone: row[3]
        }));
    }

    addTeacher(name, email = '', phone = '') {
        this.db.run(`INSERT OR IGNORE INTO teachers (name, email, phone) VALUES (?, ?, ?)`, [name, email, phone]);
        this.save();
    }

    deleteTeacher(id) {
        this.db.run(`DELETE FROM schedule_teachers WHERE teacher_id = ?`, [id]);
        this.db.run(`DELETE FROM teachers WHERE id = ?`, [id]);
        this.save();
    }

    getThemeSettings() {
        const result = this.db.exec(`SELECT * FROM theme_settings WHERE id = 1`);
        if (result.length === 0) return null;
        
        const columns = result[0].columns;
        const row = result[0].values[0];
        const obj = {};
        
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        
        return obj;
    }

    updateThemeSettings(settings) {
        this.db.run(`
            UPDATE theme_settings 
            SET title = ?, subtitle = ?, background = ?, header_text_color = ?,
                header_text_shadow = ?, primary_button_color = ?, 
                controls_background = ?, controls_text_color = ?
            WHERE id = 1
        `, [
            settings.title,
            settings.subtitle,
            settings.background,
            settings.header_text_color,
            settings.header_text_shadow,
            settings.primary_button_color,
            settings.controls_background,
            settings.controls_text_color
        ]);
        this.save();
    }

    getPDFSettings() {
        const result = this.db.exec(`SELECT * FROM pdf_settings WHERE id = 1`);
        if (result.length === 0) {
            // Return defaults if not found
            return {
                time_font_size: 7,
                grade_font_size: 7,
                subject_font_size: 10,
                subject_line2_font_size: 9,
                student_font_size: 7.5,
                teacher_font_size: 7.5,
                note_font_size: 7,
                columns_per_page: 4,
                rows_per_page: 4,
                padding_before_subject: 10,
                padding_after_subject: 6,
                padding_after_students: 2,
                padding_after_teachers: 5,
                padding_before_note: 2
            };
        }
        
        const columns = result[0].columns;
        const row = result[0].values[0];
        const obj = {};
        
        columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        
        return obj;
    }

    updatePDFSettings(settings) {
        this.db.run(`
            UPDATE pdf_settings 
            SET time_font_size = ?, grade_font_size = ?, subject_font_size = ?,
                subject_line2_font_size = ?, student_font_size = ?, teacher_font_size = ?,
                note_font_size = ?, columns_per_page = ?, rows_per_page = ?,
                padding_before_subject = ?, padding_after_subject = ?,
                padding_after_students = ?, padding_after_teachers = ?,
                padding_before_note = ?
            WHERE id = 1
        `, [
            settings.time_font_size || 7,
            settings.grade_font_size || 7,
            settings.subject_font_size || 10,
            settings.subject_line2_font_size || 9,
            settings.student_font_size || 7.5,
            settings.teacher_font_size || 7.5,
            settings.note_font_size || 7,
            settings.columns_per_page || 4,
            settings.rows_per_page || 4,
            settings.padding_before_subject || 10,
            settings.padding_after_subject || 6,
            settings.padding_after_students || 2,
            settings.padding_after_teachers || 5,
            settings.padding_before_note || 2
        ]);
        this.save();
    }

    exportData() {
        const schedule = this.getSchedule();
        const theme = this.getThemeSettings();
        const pdfSettings = this.getPDFSettings();
        const students = this.getAllStudents();
        const teachers = this.getAllTeachers();
        
        return {
            version: '1.1',
            exportDate: new Date().toISOString(),
            schedule,
            theme,
            pdfSettings,
            students,
            teachers
        };
    }

    importData(data) {
        // Clear existing data
        this.db.run(`DELETE FROM schedule_students`);
        this.db.run(`DELETE FROM schedule`);
        this.db.run(`DELETE FROM students`);
        
        // Import students
        if (data.students) {
            data.students.forEach(name => {
                this.db.run(`INSERT OR IGNORE INTO students (name) VALUES (?)`, [name]);
            });
        }
        
        // Import schedule
        if (data.schedule) {
            data.schedule.forEach(entry => {
                this.addScheduleEntry(entry);
            });
        }
        
        // Import theme
        if (data.theme) {
            this.updateThemeSettings(data.theme);
        }
        
        // Import PDF settings
        if (data.pdfSettings) {
            this.updatePDFSettings(data.pdfSettings);
        }
        
        this.save();
    }

    resetToDefaults() {
        // Clear all tables
        this.db.run(`DELETE FROM schedule_students`);
        this.db.run(`DELETE FROM schedule`);
        this.db.run(`DELETE FROM students`);
        this.db.run(`DELETE FROM theme_settings`);
        
        // Re-insert default data
        this.insertDefaultData();
    }
}

// Export for use in other files
window.ScheduleDatabase = ScheduleDatabase;