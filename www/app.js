/* EduPortal – student registration (Android app)
 *
 * Same screens and behaviour as the original Express app:
 *   #/                    -> Student Registration form        (was GET /)
 *   #/student/<id>[/new]  -> Registration success / profile   (was GET /student/:id)
 *   #/admin               -> Registrations dashboard          (was GET /admin)
 *
 * The server's in-memory array is replaced by on-device storage, so records
 * now survive closing the app.
 */
(function () {
    "use strict";

    var STORE_KEY = "eduportal.students";
    var app = document.getElementById("app");
    var navLink = document.getElementById("nav-link");
    var memoryFallback = [];

    /* ---------- Data layer (replaces `const students = []` in server.js) ---------- */
    function loadStudents() {
        try {
            var raw = window.localStorage.getItem(STORE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return memoryFallback;
        }
    }

    function saveStudents(list) {
        memoryFallback = list;
        try { window.localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) { /* keep in memory */ }
    }

    function generateId() {
        // Same format as the server: 7 chars, upper-case, base36
        var id;
        var existing = loadStudents().map(function (s) { return s.id; });
        do { id = Math.random().toString(36).substring(2, 9).toUpperCase(); }
        while (id.length < 7 || existing.indexOf(id) !== -1);
        return id;
    }

    function findStudent(id) {
        return loadStudents().filter(function (s) { return s.id === id; })[0];
    }

    /* ---------- Helpers ---------- */
    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function setChrome(opts) {
        document.body.classList.toggle("admin-body", !!opts.admin);
        navLink.textContent = opts.navText;
        navLink.setAttribute("href", opts.navHref);
        document.getElementById("logo").textContent = opts.logo || "EduPortal";
        window.scrollTo(0, 0);
    }

    /* ---------- Screen: registration form ---------- */
    function renderForm() {
        setChrome({ navText: "Admin Dashboard", navHref: "#/admin" });
        document.title = "Registration Form - EduPortal";
        app.innerHTML =
            '<div class="container"><div class="form-wrapper">' +
            '<h1>Student Registration</h1>' +
            '<p class="subtitle">Please fill out the details below.</p>' +
            '<form id="reg-form" autocomplete="on">' +
            '  <div class="form-group"><label for="username">Full Name</label>' +
            '    <input type="text" id="username" name="username" placeholder="Enter your full name" autocomplete="name" required /></div>' +
            '  <div class="form-row">' +
            '    <div class="form-group"><label for="email">Email Address</label>' +
            '      <input type="email" id="email" name="email" placeholder="john@example.com" autocomplete="email" required /></div>' +
            '    <div class="form-group"><label for="phone">Contact Number</label>' +
            '      <input type="tel" id="phone" name="phone" placeholder="e.g. +1 234 567 8900" autocomplete="tel" required /></div>' +
            '  </div>' +
            '  <div class="form-row">' +
            '    <div class="form-group"><label for="age">Age</label>' +
            '      <input type="number" id="age" name="age" placeholder="e.g. 20" min="1" max="120" inputmode="numeric" required /></div>' +
            '    <div class="form-group"><label for="gender">Gender</label>' +
            '      <div class="select-wrapper"><select id="gender" name="gender" required>' +
            '        <option value="" disabled selected>Select Gender</option>' +
            '        <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>' +
            '      </select></div></div>' +
            '  </div>' +
            '  <div class="form-row">' +
            '    <div class="form-group"><label for="branch">Branch</label>' +
            '      <div class="select-wrapper"><select id="branch" name="branch" required>' +
            '        <option value="" disabled selected>Select Branch</option>' +
            '        <option value="Computer Science">Computer Science</option>' +
            '        <option value="Electrical Engineering">Electrical Engineering</option>' +
            '        <option value="Mechanical Engineering">Mechanical Engineering</option>' +
            '        <option value="Civil Engineering">Civil Engineering</option>' +
            '        <option value="Other">Other</option>' +
            '      </select></div></div>' +
            '    <div class="form-group"><label for="qualification">Qualification</label>' +
            '      <input type="text" id="qualification" name="qualification" placeholder="e.g. B.Tech, M.Tech" required /></div>' +
            '  </div>' +
            '  <div class="form-group"><label for="address">Full Address</label>' +
            '    <textarea id="address" name="address" rows="3" placeholder="Enter your complete residential address" required></textarea></div>' +
            '  <button type="submit" class="submit-btn" id="submit-btn">Submit Registration</button>' +
            '</form></div></div>';

        document.getElementById("reg-form").addEventListener("submit", function (ev) {
            ev.preventDefault();
            var f = ev.target;
            var val = function (name) { return f.elements[name].value.trim(); };
            var student = {
                id: generateId(),
                username: val("username"),
                email: val("email"),
                phone: val("phone"),
                age: val("age"),
                gender: val("gender"),
                branch: val("branch"),
                qualification: val("qualification"),
                address: val("address"),
                registeredAt: new Date().toISOString()
            };
            var list = loadStudents();
            list.push(student);
            saveStudents(list);
            location.hash = "#/student/" + student.id + "/new";
        });
    }

    /* ---------- Screen: student profile / success ---------- */
    function renderStudent(id, isNew) {
        var s = findStudent(id);
        setChrome({ navText: "Admin Dashboard", navHref: "#/admin" });
        if (!s) {
            document.title = "Student Not Found";
            app.innerHTML = "<h1 style='text-align:center;font-family:sans-serif;width:100%'>Student Not Found</h1>";
            return;
        }
        document.title = "Student Portal - " + s.username;
        var item = function (label, value, full) {
            return '<div class="profile-item' + (full ? ' full-width' : '') + '">' +
                '<span class="result-label">' + label + '</span> ' +
                '<span class="result-value">' + esc(value || "N/A") + '</span></div>';
        };
        app.innerHTML =
            '<div class="container portal-container"><div class="form-wrapper result-card">' +
            '<div class="success-icon">\u2713</div>' +
            '<h1>' + (isNew ? "Registration Successful!" : "Student Profile") + '</h1>' +
            '<p class="subtitle">Student ID: <strong>' + esc(s.id) + '</strong></p>' +
            '<div class="profile-grid">' +
            item("Name", s.username) + item("Email", s.email) + item("Contact", s.phone) +
            item("Age", s.age) + item("Gender", s.gender) + item("Branch", s.branch) +
            item("Qualification", s.qualification) + item("Address", s.address, true) +
            '</div>' +
            '<div class="button-group">' +
            '<a href="#/" class="back-link">Register Another</a>' +
            '<a href="#/admin" class="back-link primary">Dashboard</a>' +
            '</div></div></div>';
    }

    /* ---------- Screen: admin dashboard ---------- */
    function renderAdmin() {
        var students = loadStudents();
        setChrome({ admin: true, navText: "Add New Student", navHref: "#/", logo: "EduPortal Admin" });
        document.title = "Admin Dashboard - EduPortal";

        var rows;
        if (!students.length) {
            rows = '<tr><td colspan="8" class="text-center">No students registered yet.</td></tr>';
        } else {
            rows = students.map(function (s) {
                return '<tr>' +
                    '<td><strong>' + esc(s.id) + '</strong></td>' +
                    '<td>' + esc(s.username) + '</td>' +
                    '<td>' + esc(s.email) + '</td>' +
                    '<td>' + esc(s.phone) + '</td>' +
                    '<td>' + esc(s.gender) + '</td>' +
                    '<td>' + esc(s.branch) + '</td>' +
                    '<td>' + esc(s.qualification) + '</td>' +
                    '<td><a href="#/student/' + encodeURIComponent(s.id) + '" class="view-link">View</a></td>' +
                    '</tr>';
            }).join("");
        }

        app.innerHTML =
            '<div class="admin-container">' +
            '<div class="admin-header"><h1>Registrations Dashboard</h1>' +
            '<div class="stat-badge">Total Registered: <strong>' + students.length + '</strong></div></div>' +
            '<div class="table-container"><table class="admin-table"><thead><tr>' +
            '<th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Gender</th><th>Branch</th><th>Qualification</th><th>Action</th>' +
            '</tr></thead><tbody>' + rows + '</tbody></table></div></div>';
    }

    /* ---------- Router ---------- */
    function route() {
        var hash = location.hash.replace(/^#/, "") || "/";
        var m;
        if (hash === "/admin") return renderAdmin();
        if ((m = hash.match(/^\/student\/([^\/]+)(\/new)?$/))) return renderStudent(decodeURIComponent(m[1]), !!m[2]);
        return renderForm();
    }

    window.addEventListener("hashchange", route);
    route();
})();
