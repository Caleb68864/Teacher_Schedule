// Schedule Manager - Main viewing and management logic
class ScheduleManager {
    constructor() {
        this.db = null;
        this.currentView = 'detailed';
        this.currentFilter = 'all';
        this.schedule = [];
    }

    async init() {
        try {
            document.getElementById('loadingSpinner').style.display = 'block';
            
            this.db = new ScheduleDatabase();
            await this.db.init();
            
            await this.loadSchedule();
            this.applyTheme();
            this.initTooltips();
            
            document.getElementById('loadingSpinner').style.display = 'none';
        } catch (error) {
            console.error('Failed to initialize:', error);
            this.showToast('Failed to load schedule database', 'error');
        }
    }

    initTooltips() {
        // Initialize Bootstrap tooltips
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    async loadSchedule() {
        this.schedule = this.db.getSchedule();
        this.renderSchedule();
    }

    renderSchedule() {
        const container = document.getElementById('scheduleContainer');
        const row = container.querySelector('.row');
        row.innerHTML = '';
        
        let filteredSchedule = this.schedule;
        
        // Apply day filter
        if (this.currentFilter !== 'all') {
            filteredSchedule = this.schedule.filter(slot => {
                const day = slot.day_of_week || 'all';
                if (day === 'all') return true;
                if (day === this.currentFilter) return true;
                if (day === 'mwf' && ['monday', 'wednesday', 'friday'].includes(this.currentFilter)) return true;
                if (day === 'tth' && ['tuesday', 'thursday'].includes(this.currentFilter)) return true;
                return false;
            });
        }
        
        filteredSchedule.forEach((slot, index) => {
            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-lg-4 col-xl-3';
            
            const slotElement = this.createTimeSlot(slot, index);
            col.appendChild(slotElement);
            row.appendChild(col);
            
            setTimeout(() => {
                slotElement.style.animationDelay = `${index * 0.05}s`;
            }, 10);
        });
        
        if (filteredSchedule.length === 0) {
            row.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No schedule entries for this day.</p></div>';
        }
    }

    createTimeSlot(slot, index) {
        const div = document.createElement('div');
        div.className = `time-slot ${slot.type}`;
        
        if (slot.color) {
            div.style.borderColor = slot.color;
            div.style.backgroundImage = `linear-gradient(to bottom, ${slot.color}15 0%, ${slot.color}08 30%, transparent 30%)`;
        }
        
        const timeHeader = document.createElement('div');
        timeHeader.className = 'time-header';
        
        const timeRange = document.createElement('div');
        timeRange.className = 'time-range';
        
        if (slot.color) {
            timeRange.style.backgroundColor = `${slot.color}20`;
            timeRange.style.color = slot.color;
        }
        
        const icon = document.createElement('i');
        icon.className = `fas ${slot.icon || 'fa-clock'}`;
        if (slot.color) {
            icon.style.color = slot.color;
        }
        timeRange.appendChild(icon);
        timeRange.appendChild(document.createTextNode(` ${slot.time}`));
        
        timeHeader.appendChild(timeRange);
        
        if (slot.grade) {
            const gradeBadge = document.createElement('span');
            gradeBadge.className = 'grade-badge';
            gradeBadge.textContent = slot.grade;
            timeHeader.appendChild(gradeBadge);
        }
        
        div.appendChild(timeHeader);
        
        const subject = document.createElement('div');
        subject.className = 'subject';
        subject.textContent = slot.subject;
        div.appendChild(subject);
        
        if (slot.students && slot.students.length > 0) {
            const students = document.createElement('div');
            students.className = 'students';
            
            slot.students.forEach(student => {
                const chip = document.createElement('span');
                chip.className = 'student-chip';
                chip.innerHTML = `<i class="fas fa-user"></i> ${student}`;
                students.appendChild(chip);
            });
            
            div.appendChild(students);
        }
        
        if (slot.teachers && slot.teachers.length > 0) {
            const teachers = document.createElement('div');
            teachers.className = 'teachers';
            
            slot.teachers.forEach(teacher => {
                const chip = document.createElement('span');
                chip.className = 'teacher-chip';
                chip.innerHTML = `<i class="fas fa-chalkboard-teacher"></i> ${teacher}`;
                teachers.appendChild(chip);
            });
            
            div.appendChild(teachers);
        }
        
        if (slot.note) {
            const note = document.createElement('div');
            note.className = 'note';
            note.innerHTML = `<i class="fas fa-info-circle"></i> ${slot.note}`;
            div.appendChild(note);
        }
        
        // Add edit button when hovering
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit this entry';
        editBtn.onclick = () => {
            window.location.href = `editor.html#entry-${slot.id}`;
        };
        div.appendChild(editBtn);
        
        return div;
    }

    setView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        const container = document.getElementById('scheduleContainer');
        if (view === 'compact') {
            container.classList.add('compact-view');
        } else {
            container.classList.remove('compact-view');
        }
    }

    filterByDay(day) {
        this.currentFilter = day;
        this.renderSchedule();
    }

    applyTheme() {
        const theme = this.db.getThemeSettings();
        if (!theme) return;
        
        // Apply background
        if (theme.background) {
            document.body.style.background = theme.background;
        }
        
        // Update header
        const headerTitle = document.getElementById('scheduleTitle');
        const headerSubtitle = document.getElementById('scheduleSubtitle');
        
        if (headerTitle) {
            headerTitle.textContent = theme.title || "Teaching Schedule";
            headerTitle.style.color = theme.header_text_color || "#ffffff";
            headerTitle.style.textShadow = theme.header_text_shadow || "2px 2px 4px rgba(0,0,0,0.3)";
        }
        
        if (headerSubtitle) {
            headerSubtitle.textContent = theme.subtitle || "Academic Year";
            headerSubtitle.style.color = theme.header_text_color || "#ffffff";
        }
        
        // Update controls
        const controls = document.querySelector('.controls');
        if (controls && theme.controls_background) {
            controls.style.background = theme.controls_background;
        }
        
        const controlsTitle = document.querySelector('.controls h3');
        if (controlsTitle && theme.controls_text_color) {
            controlsTitle.style.color = theme.controls_text_color;
        }
        
        // Update primary buttons
        if (theme.primary_button_color) {
            const style = document.createElement('style');
            style.textContent = `.btn-primary { background: ${theme.primary_button_color} !important; border: none !important; }`;
            document.head.appendChild(style);
        }
    }

    async exportJSON() {
        try {
            const data = this.db.exportData();
            const dataStr = JSON.stringify(data, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            
            const date = new Date().toISOString().split('T')[0];
            const filename = `schedule-${date}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', filename);
            linkElement.click();
            
            this.showToast('Schedule exported successfully', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showToast('Failed to export schedule', 'error');
        }
    }

    async importJSON(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Validate data structure
            if (!data.schedule || !Array.isArray(data.schedule)) {
                throw new Error('Invalid schedule format');
            }
            
            // Confirm import
            if (confirm('This will replace your current schedule. Continue?')) {
                this.db.importData(data);
                await this.loadSchedule();
                this.applyTheme();
                this.showToast('Schedule imported successfully', 'success');
            }
        } catch (error) {
            console.error('Import failed:', error);
            this.showToast('Failed to import schedule. Please check the file format.', 'error');
        }
        
        // Reset file input
        event.target.value = '';
    }

    async resetToDefaults() {
        if (confirm('This will reset all schedule data to defaults. This cannot be undone. Continue?')) {
            try {
                this.db.resetToDefaults();
                await this.loadSchedule();
                this.applyTheme();
                this.showToast('Schedule reset to defaults', 'success');
            } catch (error) {
                console.error('Reset failed:', error);
                this.showToast('Failed to reset schedule', 'error');
            }
        }
    }

    refresh() {
        this.loadSchedule();
        this.showToast('Schedule refreshed', 'success');
    }

    async exportPDF() {
        try {
            // Show loading indicator
            this.showToast('Generating PDF...', 'info');
            
            // Get jsPDF
            const { jsPDF } = window.jspdf;
            
            // Create new PDF in landscape mode
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'letter' // or 'a4'
            });
            
            // Get theme settings for header
            const theme = this.db.getThemeSettings();
            
            // Get PDF settings for font sizes
            const pdfSettings = this.db.getPDFSettings();
            
            // PDF dimensions
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;
            const usableWidth = pageWidth - (margin * 2);
            const usableHeight = pageHeight - (margin * 2);
            
            // Set up fonts and colors
            pdf.setFont('helvetica');
            
            // Add header on first page
            pdf.setFontSize(20);
            pdf.setTextColor(0, 100, 0); // Green color
            pdf.text(theme.title || 'Teaching Schedule', pageWidth / 2, margin + 10, { align: 'center' });
            
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.text(theme.subtitle || 'Academic Year', pageWidth / 2, margin + 18, { align: 'center' });
            
            // Configuration for schedule layout - use settings from database
            const columnsPerPage = pdfSettings.columns_per_page || 4;
            const rowsPerPage = pdfSettings.rows_per_page || 4;
            const itemsPerPage = columnsPerPage * rowsPerPage;
            
            // Calculate card dimensions with tighter spacing
            const cardSpacing = 4;
            const cardWidth = (usableWidth - (cardSpacing * (columnsPerPage - 1))) / columnsPerPage;
            const cardHeight = 33; // Reduced height to fit 4 rows
            
            // Starting position for first card (after header)
            let startY = margin + 30;
            let currentPage = 1;
            
            // Get filtered schedule
            let filteredSchedule = this.schedule;
            if (this.currentFilter !== 'all') {
                filteredSchedule = this.schedule.filter(slot => {
                    const day = slot.day_of_week || 'all';
                    if (day === 'all') return true;
                    if (day === this.currentFilter) return true;
                    if (day === 'mwf' && ['monday', 'wednesday', 'friday'].includes(this.currentFilter)) return true;
                    if (day === 'tth' && ['tuesday', 'thursday'].includes(this.currentFilter)) return true;
                    return false;
                });
            }
            
            // Process each schedule entry
            filteredSchedule.forEach((slot, index) => {
                // Calculate position on page
                const indexOnPage = index % itemsPerPage;
                const row = Math.floor(indexOnPage / columnsPerPage);
                const col = indexOnPage % columnsPerPage;
                
                // Check if we need a new page
                if (index > 0 && index % itemsPerPage === 0) {
                    pdf.addPage();
                    currentPage++;
                    startY = margin + 10; // Less header space on subsequent pages
                    
                    // Add page number
                    pdf.setFontSize(10);
                    pdf.setTextColor(150, 150, 150);
                    pdf.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
                }
                
                // Calculate card position
                const x = margin + (col * (cardWidth + cardSpacing));
                const y = startY + (row * (cardHeight + cardSpacing));
                
                // Get colors for this card
                const r = parseInt(slot.color.slice(1, 3), 16) || 59;
                const g = parseInt(slot.color.slice(3, 5), 16) || 130;
                const b = parseInt(slot.color.slice(5, 7), 16) || 246;
                
                // FIRST: Draw header background with rounded top corners using a custom path
                const lightR = Math.min(255, r + (255 - r) * 0.85);
                const lightG = Math.min(255, g + (255 - g) * 0.85);
                const lightB = Math.min(255, b + (255 - b) * 0.85);
                pdf.setFillColor(lightR, lightG, lightB);
                
                const headerHeight = 7;
                const radius = 2;
                const inset = 0.1; // Small inset to ensure we're inside the border
                
                // Draw rounded header rectangle manually
                // We'll create a shape with rounded top corners and square bottom
                pdf.setDrawColor(lightR, lightG, lightB); // Set draw color same as fill for clean edges
                pdf.setLineWidth(0);
                
                // Start drawing the path - manually create rounded rectangle for header
                // Since we can't use complex paths, we'll use multiple small rectangles
                // Main body (below the corners)
                pdf.rect(x + inset, y + radius, cardWidth - (inset * 2), headerHeight - radius, 'F');
                
                // Top section between corners
                pdf.rect(x + radius, y + inset, cardWidth - (radius * 2), radius, 'F');
                
                // Left side
                pdf.rect(x + inset, y + radius, radius - inset, headerHeight - radius, 'F');
                
                // Right side  
                pdf.rect(x + cardWidth - radius, y + radius, radius - inset, headerHeight - radius, 'F');
                
                // Approximate rounded corners with small rectangles
                // Top-left corner steps
                pdf.rect(x + radius * 0.3, y + radius * 0.2, radius * 0.7, radius * 0.8, 'F');
                pdf.rect(x + radius * 0.2, y + radius * 0.3, radius * 0.8, radius * 0.7, 'F');
                pdf.rect(x + radius * 0.5, y + inset, radius * 0.5, radius * 0.5, 'F');
                pdf.rect(x + inset, y + radius * 0.5, radius * 0.5, radius * 0.5, 'F');
                
                // Top-right corner steps
                pdf.rect(x + cardWidth - radius, y + radius * 0.2, radius * 0.7, radius * 0.8, 'F');
                pdf.rect(x + cardWidth - radius, y + radius * 0.3, radius * 0.8, radius * 0.7, 'F');
                pdf.rect(x + cardWidth - radius, y + inset, radius * 0.5, radius * 0.5, 'F');
                pdf.rect(x + cardWidth - radius * 0.5, y + radius * 0.5, radius * 0.5 - inset, radius * 0.5, 'F');
                
                // SECOND: Draw colored border on top
                pdf.setDrawColor(r, g, b);
                pdf.setLineWidth(0.5);
                
                // Try to use roundedRect if available in newer versions
                if (typeof pdf.roundedRect === 'function') {
                    pdf.roundedRect(x, y, cardWidth, cardHeight, 2, 2);
                } else {
                    // Draw regular rectangle border
                    pdf.rect(x, y, cardWidth, cardHeight);
                }
                
                // Optimized layout with better readability
                const padding = 2;
                let currentY = y + 4;
                
                // Time and grade on same line - use custom font sizes
                pdf.setFontSize(pdfSettings.time_font_size || 7);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(r, g, b);
                pdf.text(slot.time, x + padding, currentY);
                
                if (slot.grade) {
                    pdf.setFontSize(pdfSettings.grade_font_size || 7);
                    pdf.setTextColor(0, 100, 0);
                    pdf.text(`Grade ${slot.grade}`, x + cardWidth - padding, currentY, { align: 'right' });
                }
                
                currentY += pdfSettings.padding_before_subject || 10; // Space before subject
                
                // Subject - LARGER and more prominent with breathing room
                pdf.setFontSize(pdfSettings.subject_font_size || 10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(0, 0, 0);
                const subjectText = pdf.splitTextToSize(slot.subject, cardWidth - (padding * 2));
                pdf.text(subjectText[0], x + padding, currentY);
                if (subjectText[1]) {
                    currentY += 3.5;
                    pdf.setFontSize(pdfSettings.subject_line2_font_size || 9);
                    pdf.text(subjectText[1], x + padding, currentY);
                }
                
                currentY += pdfSettings.padding_after_subject || 6; // Space after subject
                
                // Students - with better spacing
                if (slot.students && slot.students.length > 0) {
                    pdf.setFontSize(pdfSettings.student_font_size || 7.5);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(80, 80, 80);
                    const studentText = slot.students.join(', ');
                    const studentLines = pdf.splitTextToSize(studentText, cardWidth - (padding * 2));
                    
                    // Show up to 2 lines of students
                    for (let i = 0; i < Math.min(2, studentLines.length); i++) {
                        pdf.text(studentLines[i], x + padding, currentY);
                        currentY += 3;
                    }
                    if (studentLines.length > 2) {
                        pdf.setFontSize((pdfSettings.student_font_size || 7.5) - 1);
                        pdf.text('...more', x + padding, currentY);
                        currentY += 3;
                    }
                    currentY += pdfSettings.padding_after_students || 2; // Space after students
                }
                
                // Teachers - with better spacing
                if (slot.teachers && slot.teachers.length > 0) {
                    pdf.setFontSize(pdfSettings.teacher_font_size || 7.5);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setTextColor(30, 64, 175);
                    const teacherText = 'Teacher: ' + slot.teachers.join(', ');
                    const teacherLines = pdf.splitTextToSize(teacherText, cardWidth - (padding * 2));
                    pdf.text(teacherLines[0], x + padding, currentY);
                    currentY += pdfSettings.padding_after_teachers || 5; // Space after teachers
                }
                
                // Note - with better spacing
                if (slot.note && currentY < y + cardHeight - 1) {
                    currentY += pdfSettings.padding_before_note || 2; // Space before note
                    pdf.setFontSize(pdfSettings.note_font_size || 7);
                    pdf.setFont('helvetica', 'italic');
                    pdf.setTextColor(146, 64, 14);
                    const noteText = pdf.splitTextToSize(slot.note, cardWidth - (padding * 2));
                    pdf.text(noteText[0], x + padding, Math.min(currentY, y + cardHeight - 1));
                }
            });
            
            // Add final page number if multiple pages
            if (currentPage > 1) {
                pdf.setFontSize(10);
                pdf.setTextColor(150, 150, 150);
                pdf.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
            }
            
            // Generate filename with date
            const date = new Date().toISOString().split('T')[0];
            const filename = `schedule-${date}.pdf`;
            
            // Save the PDF
            pdf.save(filename);
            
            this.showToast('PDF exported successfully!', 'success');
            
        } catch (error) {
            console.error('PDF export failed:', error);
            this.showToast('Failed to export PDF. Please try again.', 'error');
        }
    }

    printSchedule() {
        // Hide all tooltips before printing
        const tooltips = document.querySelectorAll('.tooltip');
        tooltips.forEach(tooltip => {
            tooltip.remove();
        });
        
        // Dispose of all tooltip instances
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            const tooltipInstance = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
            if (tooltipInstance) {
                tooltipInstance.hide();
                tooltipInstance.dispose();
            }
        });
        
        // Add print mode class for better control
        document.body.classList.add('print-mode');
        
        // Ensure schedule grid is properly laid out
        const container = document.getElementById('scheduleContainer');
        if (container) {
            // Force a reflow to ensure proper layout
            container.style.display = 'none';
            container.offsetHeight; // Trigger reflow
            container.style.display = '';
        }
        
        // Print
        window.print();
        
        // Remove print mode class
        document.body.classList.remove('print-mode');
        
        // Reinitialize tooltips after printing
        setTimeout(() => {
            this.initTooltips();
        }, 100);
    }

    showToast(message, type = 'info') {
        const toastEl = document.getElementById('toast');
        const toastBody = toastEl.querySelector('.toast-body');
        toastBody.textContent = message;
        
        // Set color based on type
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
const scheduleManager = new ScheduleManager();
document.addEventListener('DOMContentLoaded', () => {
    scheduleManager.init();
});