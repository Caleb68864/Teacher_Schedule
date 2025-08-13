// Schedule Editor - Entry editing functionality
class ScheduleEditor {
    constructor() {
        this.db = null;
        this.currentEntryId = null;
        this.students = [];
        this.teachers = [];
    }

    async init() {
        try {
            this.db = new ScheduleDatabase();
            await this.db.init();
            
            await this.loadScheduleList();
            await this.loadStudents();
            await this.loadTeachers();
            this.setupEventListeners();
            
            // Check if there's an entry ID in the URL hash
            const hash = window.location.hash;
            if (hash && hash.startsWith('#entry-')) {
                const id = parseInt(hash.replace('#entry-', ''));
                this.loadEntry(id);
            }
        } catch (error) {
            console.error('Failed to initialize editor:', error);
            this.showToast('Failed to load editor', 'error');
        }
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('entryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEntry();
        });

        // Color input sync
        document.getElementById('color').addEventListener('input', (e) => {
            document.getElementById('colorText').value = e.target.value;
            this.updatePreview();
        });

        document.getElementById('colorText').addEventListener('input', (e) => {
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                document.getElementById('color').value = e.target.value;
                this.updatePreview();
            }
        });

        // Update preview on any form change
        const formInputs = document.querySelectorAll('#entryForm input, #entryForm select, #entryForm textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
    }

    async loadScheduleList() {
        const schedule = this.db.getSchedule();
        const listContainer = document.getElementById('scheduleList');
        listContainer.innerHTML = '';
        
        schedule.forEach(entry => {
            const item = document.createElement('a');
            item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
            item.href = '#';
            item.onclick = (e) => {
                e.preventDefault();
                this.loadEntry(entry.id);
            };
            
            const timeSpan = document.createElement('span');
            timeSpan.innerHTML = `
                <i class="fas ${entry.icon}" style="color: ${entry.color}"></i>
                <strong>${entry.time}</strong> - ${entry.subject}
            `;
            
            const badge = document.createElement('span');
            badge.className = 'badge bg-secondary';
            badge.textContent = entry.type;
            
            item.appendChild(timeSpan);
            item.appendChild(badge);
            
            if (this.currentEntryId === entry.id) {
                item.classList.add('active');
            }
            
            listContainer.appendChild(item);
        });
    }

    async loadStudents() {
        this.students = this.db.getAllStudents();
        this.renderStudentCheckboxes();
    }

    async loadTeachers() {
        this.teachers = this.db.getAllTeachers();
        this.renderTeacherCheckboxes();
    }

    renderStudentCheckboxes() {
        const container = document.getElementById('studentCheckboxes');
        container.innerHTML = '';
        
        this.students.forEach(student => {
            const div = document.createElement('div');
            div.className = 'form-check form-check-inline';
            
            const checkbox = document.createElement('input');
            checkbox.className = 'form-check-input';
            checkbox.type = 'checkbox';
            checkbox.value = student;
            checkbox.id = `student-${student.replace(/\s+/g, '-')}`;
            
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = checkbox.id;
            label.textContent = student;
            
            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
    }

    renderTeacherCheckboxes() {
        const container = document.getElementById('teacherCheckboxes');
        container.innerHTML = '';
        
        this.teachers.forEach(teacher => {
            const div = document.createElement('div');
            div.className = 'form-check form-check-inline';
            
            const checkbox = document.createElement('input');
            checkbox.className = 'form-check-input';
            checkbox.type = 'checkbox';
            checkbox.value = teacher.name;
            checkbox.id = `teacher-${teacher.name.replace(/\s+/g, '-')}`;
            
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = checkbox.id;
            label.textContent = teacher.name;
            if (teacher.email) {
                label.title = `Email: ${teacher.email}${teacher.phone ? ', Phone: ' + teacher.phone : ''}`;
            }
            
            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
    }

    loadEntry(id) {
        const entry = this.db.getScheduleEntry(id);
        if (!entry) return;
        
        this.currentEntryId = id;
        
        // Populate form
        document.getElementById('entryId').value = id;
        document.getElementById('timeStart').value = entry.time_start;
        document.getElementById('timeEnd').value = entry.time_end;
        document.getElementById('subject').value = entry.subject;
        document.getElementById('grade').value = entry.grade || '';
        document.getElementById('type').value = entry.type || 'normal';
        document.getElementById('icon').value = entry.icon || 'fa-clock';
        document.getElementById('color').value = entry.color || '#3b82f6';
        document.getElementById('colorText').value = entry.color || '#3b82f6';
        document.getElementById('note').value = entry.note || '';
        document.getElementById('sortOrder').value = entry.sort_order || 999;
        document.getElementById('dayOfWeek').value = entry.day_of_week || 'all';
        
        // Update icon preview
        this.updateIconPreview();
        
        // Check student checkboxes
        document.querySelectorAll('#studentCheckboxes input').forEach(checkbox => {
            checkbox.checked = entry.students.includes(checkbox.value);
        });
        
        // Check teacher checkboxes
        document.querySelectorAll('#teacherCheckboxes input').forEach(checkbox => {
            checkbox.checked = entry.teachers && entry.teachers.includes(checkbox.value);
        });
        
        // Show delete button
        document.getElementById('deleteBtn').style.display = 'inline-block';
        
        // Update list selection
        this.loadScheduleList();
        
        // Update preview
        this.updatePreview();
    }

    newEntry() {
        this.clearForm();
        document.getElementById('deleteBtn').style.display = 'none';
    }

    clearForm() {
        this.currentEntryId = null;
        document.getElementById('entryForm').reset();
        document.getElementById('entryId').value = '';
        document.getElementById('deleteBtn').style.display = 'none';
        this.updateIconPreview();
        this.updatePreview();
        this.loadScheduleList();
    }

    async saveEntry() {
        const formData = {
            time_start: document.getElementById('timeStart').value,
            time_end: document.getElementById('timeEnd').value,
            subject: document.getElementById('subject').value,
            grade: document.getElementById('grade').value,
            type: document.getElementById('type').value,
            icon: document.getElementById('icon').value,
            color: document.getElementById('color').value,
            note: document.getElementById('note').value,
            sort_order: parseInt(document.getElementById('sortOrder').value) || 999,
            day_of_week: document.getElementById('dayOfWeek').value,
            students: []
        };
        
        // Get selected students
        document.querySelectorAll('#studentCheckboxes input:checked').forEach(checkbox => {
            formData.students.push(checkbox.value);
        });
        
        // Get selected teachers
        formData.teachers = [];
        document.querySelectorAll('#teacherCheckboxes input:checked').forEach(checkbox => {
            formData.teachers.push(checkbox.value);
        });
        
        try {
            if (this.currentEntryId) {
                // Update existing entry
                this.db.updateScheduleEntry(this.currentEntryId, formData);
                this.showToast('Entry updated successfully', 'success');
            } else {
                // Add new entry
                const newId = this.db.addScheduleEntry(formData);
                this.currentEntryId = newId;
                document.getElementById('entryId').value = newId;
                document.getElementById('deleteBtn').style.display = 'inline-block';
                this.showToast('Entry added successfully', 'success');
            }
            
            await this.loadScheduleList();
        } catch (error) {
            console.error('Save failed:', error);
            this.showToast('Failed to save entry', 'error');
        }
    }

    async deleteEntry() {
        if (!this.currentEntryId) return;
        
        if (confirm('Are you sure you want to delete this entry?')) {
            try {
                this.db.deleteScheduleEntry(this.currentEntryId);
                this.showToast('Entry deleted successfully', 'success');
                this.clearForm();
                await this.loadScheduleList();
            } catch (error) {
                console.error('Delete failed:', error);
                this.showToast('Failed to delete entry', 'error');
            }
        }
    }

    updateIconPreview() {
        const icon = document.getElementById('icon').value;
        document.getElementById('iconPreview').className = `fas ${icon}`;
    }

    syncColorInputs() {
        const colorText = document.getElementById('colorText').value;
        if (/^#[0-9A-Fa-f]{6}$/.test(colorText)) {
            document.getElementById('color').value = colorText;
        }
    }

    updatePreview() {
        const preview = document.getElementById('entryPreview');
        
        const timeStart = document.getElementById('timeStart').value;
        const timeEnd = document.getElementById('timeEnd').value;
        const subject = document.getElementById('subject').value;
        const grade = document.getElementById('grade').value;
        const type = document.getElementById('type').value;
        const icon = document.getElementById('icon').value;
        const color = document.getElementById('color').value;
        const note = document.getElementById('note').value;
        
        const selectedStudents = [];
        document.querySelectorAll('#studentCheckboxes input:checked').forEach(checkbox => {
            selectedStudents.push(checkbox.value);
        });
        
        if (!timeStart || !timeEnd || !subject) {
            preview.innerHTML = '<p class="text-muted">Fill in the form to see preview</p>';
            return;
        }
        
        // Create preview using the same structure as the main schedule
        const div = document.createElement('div');
        div.className = `time-slot ${type}`;
        div.style.borderColor = color;
        div.style.backgroundImage = `linear-gradient(to bottom, ${color}15 0%, ${color}08 30%, transparent 30%)`;
        
        const timeHeader = document.createElement('div');
        timeHeader.className = 'time-header';
        
        const timeRange = document.createElement('div');
        timeRange.className = 'time-range';
        timeRange.style.backgroundColor = `${color}20`;
        timeRange.style.color = color;
        timeRange.innerHTML = `<i class="fas ${icon}"></i> ${timeStart}-${timeEnd}`;
        
        timeHeader.appendChild(timeRange);
        
        if (grade) {
            const gradeBadge = document.createElement('span');
            gradeBadge.className = 'grade-badge';
            gradeBadge.textContent = grade;
            timeHeader.appendChild(gradeBadge);
        }
        
        div.appendChild(timeHeader);
        
        const subjectDiv = document.createElement('div');
        subjectDiv.className = 'subject';
        subjectDiv.textContent = subject;
        div.appendChild(subjectDiv);
        
        if (selectedStudents.length > 0) {
            const students = document.createElement('div');
            students.className = 'students';
            
            selectedStudents.forEach(student => {
                const chip = document.createElement('span');
                chip.className = 'student-chip';
                chip.innerHTML = `<i class="fas fa-user"></i> ${student}`;
                students.appendChild(chip);
            });
            
            div.appendChild(students);
        }
        
        if (note) {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'note';
            noteDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${note}`;
            div.appendChild(noteDiv);
        }
        
        preview.innerHTML = '';
        preview.appendChild(div);
    }

    openThemeModal() {
        const theme = this.db.getThemeSettings();
        if (theme) {
            document.getElementById('themeTitle').value = theme.title || '';
            document.getElementById('themeSubtitle').value = theme.subtitle || '';
            document.getElementById('themeBackground').value = theme.background || '';
            document.getElementById('themeHeaderColor').value = theme.header_text_color || '#ffffff';
            document.getElementById('themeControlsBg').value = theme.controls_background || '#fef3c7';
        }
        
        const modal = new bootstrap.Modal(document.getElementById('themeModal'));
        modal.show();
    }

    saveTheme() {
        const theme = {
            title: document.getElementById('themeTitle').value,
            subtitle: document.getElementById('themeSubtitle').value,
            background: document.getElementById('themeBackground').value,
            header_text_color: document.getElementById('themeHeaderColor').value,
            header_text_shadow: '2px 2px 4px rgba(0,0,0,0.3)',
            primary_button_color: 'linear-gradient(135deg, #16a34a 0%, #84cc16 100%)',
            controls_background: document.getElementById('themeControlsBg').value,
            controls_text_color: '#365314'
        };
        
        try {
            this.db.updateThemeSettings(theme);
            this.showToast('Theme settings saved', 'success');
            bootstrap.Modal.getInstance(document.getElementById('themeModal')).hide();
        } catch (error) {
            console.error('Failed to save theme:', error);
            this.showToast('Failed to save theme', 'error');
        }
    }

    openStudentModal() {
        this.loadStudentList();
        const modal = new bootstrap.Modal(document.getElementById('studentModal'));
        modal.show();
    }

    loadStudentList() {
        const list = document.getElementById('studentList');
        list.innerHTML = '';
        
        this.students.forEach(student => {
            const item = document.createElement('div');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.textContent = student;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = () => this.deleteStudent(student);
            
            item.appendChild(deleteBtn);
            list.appendChild(item);
        });
    }

    async addStudent() {
        const input = document.getElementById('newStudentName');
        const name = input.value.trim();
        
        if (!name) return;
        
        try {
            this.db.db.run(`INSERT OR IGNORE INTO students (name) VALUES (?)`, [name]);
            this.db.save();
            input.value = '';
            await this.loadStudents();
            this.loadStudentList();
            this.showToast('Student added', 'success');
        } catch (error) {
            console.error('Failed to add student:', error);
            this.showToast('Failed to add student', 'error');
        }
    }

    async deleteStudent(name) {
        if (!confirm(`Delete student "${name}"? This will remove them from all schedule entries.`)) {
            return;
        }
        
        try {
            const result = this.db.db.exec(`SELECT id FROM students WHERE name = ?`, [name]);
            if (result.length > 0) {
                const studentId = result[0].values[0][0];
                this.db.db.run(`DELETE FROM schedule_students WHERE student_id = ?`, [studentId]);
                this.db.db.run(`DELETE FROM students WHERE id = ?`, [studentId]);
                this.db.save();
                await this.loadStudents();
                this.loadStudentList();
                this.showToast('Student deleted', 'success');
            }
        } catch (error) {
            console.error('Failed to delete student:', error);
            this.showToast('Failed to delete student', 'error');
        }
    }

    openTeacherModal() {
        this.loadTeacherList();
        
        // Setup form handler
        document.getElementById('teacherForm').onsubmit = (e) => {
            e.preventDefault();
            this.addTeacher();
        };
        
        const modal = new bootstrap.Modal(document.getElementById('teacherModal'));
        modal.show();
    }

    loadTeacherList() {
        const list = document.getElementById('teacherList');
        list.innerHTML = '';
        
        this.teachers.forEach(teacher => {
            const item = document.createElement('div');
            item.className = 'list-group-item';
            
            const row = document.createElement('div');
            row.className = 'd-flex justify-content-between align-items-center';
            
            const info = document.createElement('div');
            info.innerHTML = `
                <strong>${teacher.name}</strong>
                ${teacher.email ? `<br><small class="text-muted"><i class="fas fa-envelope"></i> ${teacher.email}</small>` : ''}
                ${teacher.phone ? `<br><small class="text-muted"><i class="fas fa-phone"></i> ${teacher.phone}</small>` : ''}
            `;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-danger';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = () => this.deleteTeacher(teacher.id);
            
            row.appendChild(info);
            row.appendChild(deleteBtn);
            item.appendChild(row);
            list.appendChild(item);
        });
    }

    async addTeacher() {
        const name = document.getElementById('newTeacherName').value.trim();
        const email = document.getElementById('newTeacherEmail').value.trim();
        const phone = document.getElementById('newTeacherPhone').value.trim();
        
        if (!name) return;
        
        try {
            this.db.addTeacher(name, email, phone);
            document.getElementById('teacherForm').reset();
            await this.loadTeachers();
            this.loadTeacherList();
            this.showToast('Teacher added', 'success');
        } catch (error) {
            console.error('Failed to add teacher:', error);
            this.showToast('Failed to add teacher', 'error');
        }
    }

    async deleteTeacher(id) {
        if (!confirm('Delete this teacher? They will be removed from all schedule entries.')) {
            return;
        }
        
        try {
            this.db.deleteTeacher(id);
            await this.loadTeachers();
            this.loadTeacherList();
            this.showToast('Teacher deleted', 'success');
        } catch (error) {
            console.error('Failed to delete teacher:', error);
            this.showToast('Failed to delete teacher', 'error');
        }
    }

    openPDFSettingsModal() {
        // Load current PDF settings
        const settings = this.db.getPDFSettings();
        
        // Populate form with current settings
        document.getElementById('pdfTimeFontSize').value = settings.time_font_size || 7;
        document.getElementById('pdfGradeFontSize').value = settings.grade_font_size || 7;
        document.getElementById('pdfSubjectFontSize').value = settings.subject_font_size || 10;
        document.getElementById('pdfSubjectLine2FontSize').value = settings.subject_line2_font_size || 9;
        document.getElementById('pdfStudentFontSize').value = settings.student_font_size || 7.5;
        document.getElementById('pdfTeacherFontSize').value = settings.teacher_font_size || 7.5;
        document.getElementById('pdfNoteFontSize').value = settings.note_font_size || 7;
        document.getElementById('pdfColumnsPerPage').value = settings.columns_per_page || 4;
        document.getElementById('pdfRowsPerPage').value = settings.rows_per_page || 4;
        
        // Populate padding settings
        document.getElementById('pdfPaddingBeforeSubject').value = settings.padding_before_subject || 10;
        document.getElementById('pdfPaddingAfterSubject').value = settings.padding_after_subject || 6;
        document.getElementById('pdfPaddingAfterStudents').value = settings.padding_after_students || 2;
        document.getElementById('pdfPaddingAfterTeachers').value = settings.padding_after_teachers || 5;
        document.getElementById('pdfPaddingBeforeNote').value = settings.padding_before_note || 2;
        
        const modal = new bootstrap.Modal(document.getElementById('pdfSettingsModal'));
        modal.show();
    }
    
    savePDFSettings() {
        try {
            const settings = {
                time_font_size: parseFloat(document.getElementById('pdfTimeFontSize').value),
                grade_font_size: parseFloat(document.getElementById('pdfGradeFontSize').value),
                subject_font_size: parseFloat(document.getElementById('pdfSubjectFontSize').value),
                subject_line2_font_size: parseFloat(document.getElementById('pdfSubjectLine2FontSize').value),
                student_font_size: parseFloat(document.getElementById('pdfStudentFontSize').value),
                teacher_font_size: parseFloat(document.getElementById('pdfTeacherFontSize').value),
                note_font_size: parseFloat(document.getElementById('pdfNoteFontSize').value),
                columns_per_page: parseInt(document.getElementById('pdfColumnsPerPage').value),
                rows_per_page: parseInt(document.getElementById('pdfRowsPerPage').value),
                padding_before_subject: parseFloat(document.getElementById('pdfPaddingBeforeSubject').value),
                padding_after_subject: parseFloat(document.getElementById('pdfPaddingAfterSubject').value),
                padding_after_students: parseFloat(document.getElementById('pdfPaddingAfterStudents').value),
                padding_after_teachers: parseFloat(document.getElementById('pdfPaddingAfterTeachers').value),
                padding_before_note: parseFloat(document.getElementById('pdfPaddingBeforeNote').value)
            };
            
            this.db.updatePDFSettings(settings);
            this.showToast('PDF settings saved successfully', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('pdfSettingsModal'));
            modal.hide();
        } catch (error) {
            console.error('Failed to save PDF settings:', error);
            this.showToast('Failed to save PDF settings', 'error');
        }
    }
    
    resetPDFSettings() {
        if (confirm('Reset all PDF settings to defaults?')) {
            // Set default values
            document.getElementById('pdfTimeFontSize').value = 7;
            document.getElementById('pdfGradeFontSize').value = 7;
            document.getElementById('pdfSubjectFontSize').value = 10;
            document.getElementById('pdfSubjectLine2FontSize').value = 9;
            document.getElementById('pdfStudentFontSize').value = 7.5;
            document.getElementById('pdfTeacherFontSize').value = 7.5;
            document.getElementById('pdfNoteFontSize').value = 7;
            document.getElementById('pdfColumnsPerPage').value = 4;
            document.getElementById('pdfRowsPerPage').value = 4;
            document.getElementById('pdfPaddingBeforeSubject').value = 10;
            document.getElementById('pdfPaddingAfterSubject').value = 6;
            document.getElementById('pdfPaddingAfterStudents').value = 2;
            document.getElementById('pdfPaddingAfterTeachers').value = 5;
            document.getElementById('pdfPaddingBeforeNote').value = 2;
            
            this.showToast('PDF settings reset to defaults', 'info');
        }
    }

    showToast(message, type = 'info') {
        const toastEl = document.getElementById('toast');
        const toastBody = toastEl.querySelector('.toast-body');
        toastBody.textContent = message;
        
        toastEl.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
        if (type === 'success') toastEl.classList.add('bg-success', 'text-white');
        else if (type === 'error') toastEl.classList.add('bg-danger', 'text-white');
        else if (type === 'warning') toastEl.classList.add('bg-warning');
        else toastEl.classList.add('bg-info', 'text-white');
        
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// Initialize on page load
const editor = new ScheduleEditor();
document.addEventListener('DOMContentLoaded', () => {
    editor.init();
});