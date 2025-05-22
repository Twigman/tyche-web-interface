# Tyche Web Interface

A modular web frontend for monitoring and controlling an automation system. It features both a real-time dashboard and an interactive terminal-like console with a custom command parser.

## 🔧 Features

- Real-time visualization of sensor data
- Display of mobile device network (Wi-Fi) connection status
- Automation mode control (`Home`, `Away`, `Cooking`, etc.)
- Interactive console with structured command syntax
- Command suggestions (ghost commands) as you type
- Auto-completion with `TAB`
- Command history navigation using arrow keys
- Rich console output with **Markdown formatting**
- Color-coded modules and log levels for better readability
- Communication with backend via REST or WebSocket
- Extensible command parser with options, subcommands, and arguments

## 💡 Example Command Usage

Commands follow a general structure similar to Unix-style CLI:

```
command [subcommand] [--option <value>] [--flag] [argument1] [argument2] ...
```

### Example:
```bash
timer start --duration 30m --label "pasta"
```

> Starts a 30-minute timer labeled “pasta”.

---

## 📦 Supported Commands

```
connect      → Establish connection to backend
disconnect   → Terminate connection
help         → Display general help overview
man          → Show manual for a specific command
spotify      → Control music playback (for testing purposes)
timer        → Start, stop, and manage timers
```

---

## 🛠️ Technologies Used

- [Vue.js 3](https://vuejs.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [Lucide-Vue](https://lucide.dev/icons)
- TypeScript

---

## 🚀 Getting Started

```bash
git clone https://github.com/twigman/tyche-web-interface
cd tyche-web-interface
yarn install
yarn dev --mode development
```

---

## 📸 Screenshots

### Sensor Dashboard
A real-time overview of all connected sensors with chart visualizations.
![Sensor Dashboard](./img/ui_2025-03-12.jpg)

---

### Timer Command + Auto Profile Switching
Demonstrates CLI usage to list timers and automatically switch profiles based on timed events.
![auto_profile](./img/ui_cli_auto_profile.jpg)

---

### Phone Connectivity Integration
- When phone disconnects:
  ![phone_disconnect](./img/ui_cli_phone_disconnected.jpg)
- When phone reconnects (triggered by hallway motion detection):
  ![phone_connect_burst](./img/ui_cli_phone_connect_burst.jpg)

---

### Profile Selection
Manual profile switching via dropdown menu.
![profile_selection](./img/ui_profile_selection.jpg)

---

### Spotify Control & Command Documentation
- Send music control commands through the CLI.
  ![spotify_command](./img/ui_cli_spotify.jpg)
- View detailed manual via `man spotify`.
  ![spotify_man](./img/ui_cli_man_spotify.jpg)

---

### CLI Ghost Commands
Shows predictive command suggestions while typing.
![ghost_command](./img/ui_ghost_text.jpg)

---

## 🔗 Related Repositories

- [Tyche Backend](https://github.com/Twigman/tyche)

