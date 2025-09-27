
    // Global variables
    let is24Hour = false;
    let showSeconds = true;
    let isDarkTheme = false;
    let autoTheme = true;
    let pomodoroInterval;
    let pomodoroTime = 25 * 60; // 25 minutes
    let isPomodoroRunning = false;
    let stopwatchInterval;
    let stopwatchTime = 0;
    let isStopwatchRunning = false;
    let lapCounter = 0;

    // Initialize app
    function init() {
        loadSettings();
        updateMainClock();
        updateWorldClocks();
        setInterval(updateMainClock, 1000);
        setInterval(updateWorldClocks, 1000);
    }

    // Update main clock
    function updateMainClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        let period = "";
        if (!is24Hour) {
            period = hours >= 12 ? "PM" : "AM";
            hours = hours % 12 || 12;
        }

        const timeString = 
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}` +
            (showSeconds ? `:${String(seconds).padStart(2, "0")}` : "") +
            (is24Hour ? "" : ` ${period}`);

        document.getElementById("mainTime").textContent = timeString;

        // Date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById("mainDate").textContent = now.toLocaleDateString(undefined, options);

        // Time period greeting
        const hour = now.getHours();
        let greeting = "Hello";
        if (hour < 12) greeting = "Good Morning";
        else if (hour < 18) greeting = "Good Afternoon";
        else if (hour < 21) greeting = "Good Evening";
        else greeting = "Good Night";
        document.getElementById("timePeriod").textContent = greeting;

        // Extra details
        document.getElementById("userTimezone").textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
        document.getElementById("utcOffset").textContent = `UTC ${-now.getTimezoneOffset() / 60}`;
        document.getElementById("dayOfYear").textContent = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
        document.getElementById("weekNumber").textContent = Math.ceil((((now - new Date(now.getFullYear(), 0, 1)) / 86400000) + new Date(now.getFullYear(), 0, 1).getDay() + 1) / 7);
    }

    // World clocks
    function updateWorldClocks() {
        const zones = [
            { id: "tokyo", tz: "Asia/Tokyo" },
            { id: "dubai", tz: "Asia/Dubai" },
            { id: "london", tz: "Europe/London" },
            { id: "ny", tz: "America/New_York" },
            { id: "la", tz: "America/Los_Angeles" },
            { id: "sydney", tz: "Australia/Sydney" }
        ];

        zones.forEach(zone => {
            const now = new Date();
            const options = { hour: "2-digit", minute: "2-digit", second: showSeconds ? "2-digit" : undefined, hour12: !is24Hour, timeZone: zone.tz };
            const dateOptions = { weekday: "short", month: "short", day: "numeric", timeZone: zone.tz };
            document.getElementById(zone.id + "Time").textContent = now.toLocaleTimeString([], options);
            document.getElementById(zone.id + "Date").textContent = now.toLocaleDateString([], dateOptions);
        });
    }

    // Theme toggle
    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        document.documentElement.setAttribute("data-theme", isDarkTheme ? "dark" : "light");
        document.getElementById("themeToggle").textContent = isDarkTheme ? "☀️ Light" : "🌙 Dark";
        saveSettings();
    }

    // Time format toggle
    function toggleTimeFormat() {
        is24Hour = !is24Hour;
        document.getElementById("formatToggle").textContent = is24Hour ? "12H" : "24H";
        saveSettings();
    }

    // Seconds toggle
    function toggleSeconds() {
        showSeconds = !showSeconds;
        document.getElementById("secondsSwitch").classList.toggle("active", showSeconds);
        saveSettings();
    }

    // Auto theme toggle
    function toggleAutoTheme() {
        autoTheme = !autoTheme;
        document.getElementById("autoThemeSwitch").classList.toggle("active", autoTheme);
        saveSettings();
    }

    // Save & load settings
    function saveSettings() {
        const settings = { is24Hour, showSeconds, isDarkTheme, autoTheme, pomodoroTime };
        localStorage.setItem("timeflowSettings", JSON.stringify(settings));
    }
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem("timeflowSettings"));
        if (!settings) return;
        is24Hour = settings.is24Hour;
        showSeconds = settings.showSeconds;
        isDarkTheme = settings.isDarkTheme;
        autoTheme = settings.autoTheme;
        pomodoroTime = settings.pomodoroTime || 25 * 60;
        if (isDarkTheme) document.documentElement.setAttribute("data-theme", "dark");
    }

    // Pomodoro
    function startPomodoro() {
        if (isPomodoroRunning) return;
        isPomodoroRunning = true;
        pomodoroInterval = setInterval(() => {
            if (pomodoroTime > 0) {
                pomodoroTime--;
                updatePomodoroDisplay();
            } else {
                clearInterval(pomodoroInterval);
                isPomodoroRunning = false;
                document.getElementById("pomodoroStatus").textContent = "Session Over!";
            }
        }, 1000);
    }
    function resetPomodoro() {
        clearInterval(pomodoroInterval);
        pomodoroTime = document.getElementById("focusDuration").value * 60;
        isPomodoroRunning = false;
        updatePomodoroDisplay();
        document.getElementById("pomodoroStatus").textContent = "Ready to Focus";
    }
    function updatePomodoroDisplay() {
        const minutes = Math.floor(pomodoroTime / 60);
        const seconds = pomodoroTime % 60;
        document.getElementById("pomodoroTime").textContent = `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
        const progress = ((document.getElementById("focusDuration").value * 60 - pomodoroTime) / (document.getElementById("focusDuration").value * 60)) * 360;
        document.getElementById("pomodoroCircle").style.setProperty("--progress", `${progress}deg`);
    }
    function updateFocusDuration() {
        pomodoroTime = document.getElementById("focusDuration").value * 60;
        updatePomodoroDisplay();
        saveSettings();
    }

    // Stopwatch
    function startStopwatch() {
        if (isStopwatchRunning) return;
        isStopwatchRunning = true;
        stopwatchInterval = setInterval(() => {
            stopwatchTime++;
            updateStopwatchDisplay();
        }, 1000);
    }
    function resetStopwatch() {
        clearInterval(stopwatchInterval);
        stopwatchTime = 0;
        isStopwatchRunning = false;
        updateStopwatchDisplay();
        document.getElementById("lapTimes").innerHTML = "";
        lapCounter = 0;
    }
    function updateStopwatchDisplay() {
        const hours = Math.floor(stopwatchTime / 3600);
        const minutes = Math.floor((stopwatchTime % 3600) / 60);
        const seconds = stopwatchTime % 60;
        document.getElementById("stopwatchDisplay").textContent =
            `${String(hours).padStart(2,"0")}:${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;
    }
    function lapTime() {
        if (!isStopwatchRunning) return;
        lapCounter++;
        const lapDiv = document.createElement("div");
        lapDiv.classList.add("lap-item");
        lapDiv.innerHTML = `<span>Lap ${lapCounter}</span><span>${document.getElementById("stopwatchDisplay").textContent}</span>`;
        document.getElementById("lapTimes").appendChild(lapDiv);
    }

    // Switch tabs
    function switchPanel(panelId) {
        document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
        document.querySelectorAll(".nav-pill").forEach(pill => pill.classList.remove("active"));
        document.getElementById(panelId).classList.add("active");
        event.target.classList.add("active");
    }

    // Start app
    init();
