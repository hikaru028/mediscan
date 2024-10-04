<h1 style="text-align: center;">Mediscan</h1>
<p align="center">
  <img src="./frontend/web/public/images/display.png" alt="logo" width="350">
</p>

<p style="text-align: center;">
“Mediscan” is an image recognition application for Healthcare and a user-friendly AI-driven solution designed to transform how you access pharmacy products and services. With features like product image recognition, prescription text scanning, and easy navigation, the app helps you quickly find medications and place orders directly from your mobile device.
</p>

It also includes secure login and registration by implementing a one-time password (OTP) system so that your information remains protected. Built with convenience in mind, the app streamlines your pharmacy experience, making healthcare more accessible and efficient.

## 👨‍💻 Project Fellows

- Hikaru Suzuki - [hikaru028](https://github.com/hikaru028) 
- Hong Chen - [nicolivia](https://github.com/nicolivia) 
- Srimathi Sreevathsan - [srimathi-sreevathsan](https://github.com/srimathi-sreevathsan)

## 📜 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Mobile Application](#running-the-mobile-application)
- [Running the Web Application](#running-the-web-application)
- [Testing the Application](#testing-the-application)
- [License](#license)

## ✨ Features
### Mobile
- Instant medication search
- Multiple ordering options
- One-time password (OTP) verification
- Reorder button

### Web
- Authentication/Authorisation
- Stock management
- OCR medication serch
- Theme switch trigger

## 🛠️ Technologies Used

- Backend:
  - Python (Flask)
  - JWT
  - Twiliogrid
  - MySQL
 
- Mobile Frontend:
  - React Native
  - Expo Router
  - TypeScript
  - Tanstack

- Web Frontend:
  - Next.js
  - TypeScript
  - shadcn.ui
  - TailwindCSS
  - Tanstack

- Cloud Computing:
  - AWS

- Other:
  - React icons

## 🔰 Prerequisites
- In the Backend directory:
  - [Python (Flask)](https://www.python.org/downloads/)
  - [Twiliogrid](https://login.twilio.com/u/signup?state=hKFo2SBvYWUzS2lnSkhMdERESHpuRFU2eUtSRThFbXhnbkFFQ6Fur3VuaXZlcnNhbC1sb2dpbqN0aWTZIDV0UkhXZ1VyMmpVVzdGenpVQ3l2TmllV3JIbTdwaWY0o2NpZNkgTW05M1lTTDVSclpmNzdobUlKZFI3QktZYjZPOXV1cks)
  - [MySQL](https://www.mysql.com/downloads/)
- **Environment Variables**:
  - Create a `.env` file in the backend directory and include the following variables:
    ```
    SQLALCHEMY_DATABASE_URI=mysql://<MYSQL_USER>:<MYSQL_PASSWORD>@localhost/<DATABASE_NAME>
    SECRET_KEY=<Your_Secret_Key>

    MYSQL_DATABASE=<DATABASE_NAME>
    MYSQL_USER=<Your_MySQL_User>
    MYSQL_PASSWORD=<Your_MySQL_Password>
    MYSQL_ROOT_PASSWORD=<Your_MySQL_Root_Password>
    DATABASE_URL=mysql://<MYSQL_USER>:<MYSQL_PASSWORD>@localhost/<DATABASE_NAME>

    MAIL_FROM=<Your_Email_Address>
    TWILIO_ACCOUNT_SID=<Your_Twilio_Account_SID>
    TWILIO_SERVICE_SID=<Your_Twilio_Service_SID>
    TWILIO_AUTH_TOKEN=<Your_Twilio_Auth_Token>

    SENDGRID_API_KEY=<Your_SendGrid_API_Key>
    ```

- Mobile Frontend:
  - [React Native (Expo)](https://expo.dev/)
  - Ngrok
    - If you haven't already, sign up for an account on [Ngrok](https://ngrok.com/).
    - Download and install Ngrok on your local machine following the instructions on the [Ngrok download page](https://ngrok.com/download).

- Web Frontend:
  - [Node.js Node.js 18.18 or later](https://nodejs.org/en)

## 📱 Running the Mobile Application
### 1. Obtain Your Ngrok Authtoken
- After signing in, go to your Ngrok [dashboard](https://dashboard.ngrok.com/get-started/your-authtoken).
- Copy your authtoken from the dashboard.

### 2. Add Ngrok Authtoken to Your Configuration
- Open your terminal and add the authtoken to your Ngrok configuration:
  ```bash
  ngrok config add-authtoken <your-authtoken>
  ```
### 3. Navigate to Your Backend Directory
- Ensure you're in the directory where your backend code is located: `/backend`. 
  
### 4. Start the Backend Server
- Activate your virtual environment if necessary (e.g., `source venv/bin/activate`).
- run the Flask server:
  #### For macOS/Linux:
  ``` bash
  source venv/bin/activate
  ```
  #### For Windows: In Command Prompt:
  ``` bash
  venv\Scripts\activate
  ```
### 5. Install Dependencies from requirements.txt
  #### For macOS/Linux:
  ``` bash
  pip3 install -r requirements.txt
  ```
  #### For Windows: In Command Prompt:
  ``` bash
  pip install -r requirements.txt
  ```

### 6. Start the Backend Server
- Run the Flask server:
  ``` bash
  flask run --host=0.0.0.0 --reload
  ```

### 7. Start Ngrok
- Open another terminal window, navigate to the same directory as your backend.
- Start the Ngrok server to expose your Flask backend:
``` bash
ngrok http http://localhost:5000
```
- In the Ngrok console, copy the URL that appears (e.g., `https://xxx-xxx-xxx-xx-xxx.ngrok-free.app`).

### 8. Update the Ngrok URL in the Frontend
- Navigate to your `app/ngrok.ts` file in the frontend project.
- Replace the existing URL with the one you copied from Ngrok.

### 9. In the `frontend/mobile` directory, install dependencies
   ```bash
   npm install
   ```

### 10. Start the Frontend Server
- In the same frontend directory, run the following command to start the mobile application using Expo:
``` bash
npx expo start --tunnel
```
- Use the Expo Go app (Android) or the Camera app (iOS) to scan the QR code and launch the app on your mobile device.

In the output, you'll find options to open the app in a
- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

To learn more about developing your project with Expo, look at the following resources:
- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## 🖥️ Running the Web Application 
### 1. Navigate to Your Backend Directory
- Ensure you're in the directory where your backend code is located: `/backend`. 
  
### 2. Start the Backend Server
- Activate your virtual environment if necessary (e.g., `source venv/bin/activate`).
- run the Flask server:
  #### For macOS/Linux:
  ``` bash
  source venv/bin/activate
  ```
  #### For Windows: In Command Prompt:
  ``` bash
  venv\Scripts\activate
  ```
### 3. Install Dependencies from requirements.txt
  #### For macOS/Linux:
  ``` bash
  pip3 install -r requirements.txt
  ```
  #### For Windows: In Command Prompt:
  ``` bash
  pip install -r requirements.txt
  ```

### 4. Start the Backend Server
- Run the Flask server:
  ``` bash
  flask run --host=0.0.0.0 --reload
  ```
### 5. In the `frontend/web` directory, install npm package:
``` bash
npm install
# or
yarn install
# or
pnpm install
```

### 6. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

To learn more about Next.js, take a look at the following resources:
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## 📋 License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/CS778-S2-2024-Organisational-Resilience/image-recognition-app/blob/main/LICENSE) file for details.
