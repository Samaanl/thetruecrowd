# TheTrueCrowd – Visualizing Human Density

🌍 **Destroy human intuition about crowd size and population** by visualizing massive numbers of people on real-world maps.

![TheTrueCrowd Preview](https://via.placeholder.com/800x400?text=TheTrueCrowd+Preview)

## ✨ Features

- **Interactive Map**: Powered by Mapbox GL JS with smooth zoom, pan, and drag interactions
- **Crowd Presets**: From "All Humans Alive" (8.1B) to "School Classroom" (30)
- **Density Modes**: 6 different densities from "Shoulder to Shoulder" to "Rural Living"
- **Draggable Overlay**: Move the crowd visualization anywhere on the map
- **Real-time Calculations**: Accurate area calculations with contextual comparisons
- **Share Feature**: Export map views as images with viral captions
- **Mobile-First**: Fully responsive design for all devices
- **Dark/Light Mode**: Adaptive theming

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Mapbox account (free tier works)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/thetruecrowd.git
cd thetruecrowd
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your Mapbox token:

```bash
cp .env.example .env
# Edit .env and add your Mapbox token
```

4. Get your free Mapbox token:

   - Go to [mapbox.com](https://mapbox.com)
   - Create a free account
   - Copy your default public token
   - Paste it in your `.env` file

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173)

## 🏗️ Project Structure

```
thetruecrowd/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Map.jsx              # Mapbox map integration
│   │   ├── Header.jsx           # Top navigation
│   │   ├── Sidebar.jsx          # Desktop controls panel
│   │   ├── PresetSelector.jsx   # Crowd size selection
│   │   ├── DensitySelector.jsx  # Density mode selection
│   │   ├── StatsPanel.jsx       # Statistics display
│   │   ├── ShareModal.jsx       # Export/share functionality
│   │   ├── MobileControls.jsx   # Mobile-specific UI
│   │   ├── MobileStatsBar.jsx   # Collapsed mobile stats
│   │   ├── LoadingScreen.jsx    # Initial loading state
│   │   ├── Toast.jsx            # Notification system
│   │   └── HelpTooltip.jsx      # User guidance
│   ├── data/
│   │   └── presets.js           # Crowd presets & density modes
│   ├── store/
│   │   └── useStore.js          # Zustand state management
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles & Tailwind
├── .env.example                 # Environment template
├── index.html                   # HTML entry point
├── package.json                 # Dependencies
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS configuration
└── vite.config.js               # Vite configuration
```

## 🎨 Crowd Presets

| Preset               | Population    | Context                  |
| -------------------- | ------------- | ------------------------ |
| All Humans Alive     | 8,100,000,000 | Every person on Earth    |
| Population of India  | 1,430,000,000 | Most populous country    |
| Population of USA    | 335,000,000   | United States            |
| Largest Army Ever    | 12,000,000    | Soviet Red Army (1945)   |
| Taylor Swift Concert | 70,000        | Eras Tour stadium show   |
| Football Stadium     | 50,000        | Average stadium capacity |
| Small Town           | 5,000         | Typical small town       |
| Classroom            | 30            | Average classroom        |

## 📏 Density Modes

| Mode                 | Space per Person | Feeling        |
| -------------------- | ---------------- | -------------- |
| Shoulder to Shoulder | 0.25 m²          | Claustrophobic |
| Concert Tight        | 0.5 m²           | Intense        |
| Festival Loose       | 1.0 m²           | Comfortable    |
| Social Gathering     | 2.5 m²           | Relaxed        |
| Suburban Living      | 1,000 m²         | Spacious       |
| Rural Living         | 10,000 m²        | Isolated       |

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL JS
- **State**: Zustand
- **Export**: html-to-image

## 📱 Mobile Support

TheTrueCrowd is fully responsive with:

- Touch-friendly controls
- Swipe-up configuration panel
- Optimized overlay dragging
- Adaptive layouts for all screen sizes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Population data from World Bank and UN estimates
- Map tiles by Mapbox
- Inspired by the need to visualize what numbers actually mean

---

**Built with ❤️ to destroy your intuition about crowds.**

_Your brain is lying to you. Now you can see the truth._
