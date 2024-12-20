# SubTrack - Subscription Tracker

SubTrack is an intuitive mobile application for tracking your monthly subscriptions, monitoring their usage, and optimizing your expenses.

## Key Features

- **Subscription Management**: Easily add, modify, or delete your subscriptions.
- **Interactive Calendar**: Visualize the days your subscriptions have been used.
- **Detailed Statistics**: Analyze the monthly cost, usage frequency, and average cost per use for each subscription.
- **Notifications**: Receive daily reminders to keep track of your subscriptions.

## Technologies Used

- **Frontend**: React Native
- **Local Database**: SQLite (via expo-sqlite API)
- **Notifications Management**: Expo Notifications
- **Navigation**: React Navigation

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AliHELB/Subtrack.git
   cd Subtrack
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the project:
   ```bash
   npm start
   ```

4. Run the app on a simulator or physical device using Expo Go.

## Project Structure

```plaintext
.
├── components/
│   ├── CalendarScreen.js       # Displays the interactive calendar
│   ├── SubscriptionScreen.js   # Manages subscriptions
│   ├── AddSubscriptionForm.js  # Form to add a subscription
│   ├── Statistics.js           # Displays subscription statistics
│   ├── TodayCalendar.js        # Select subscriptions used today
│   └── SubscriptionDetails.js  # Details of a subscription
├── database.js                  # SQLite configuration
├── App.js                       # Entry point of the application
├── README.md                    # Project documentation
└── ...
```

## How It Works

1. **Add a Subscription**:
   - Use the form accessible from the main screen to input the name, category, cost, and color.

2. **Mark Subscriptions**:
   - Select subscriptions used each day through the "Today" screen.

3. **Analyze Statistics**:
   - View monthly statistics for subscriptions, including cost per use.

4. **Notifications**:
   - Receive a daily reminder at a defined time (default is 6:55 PM).
