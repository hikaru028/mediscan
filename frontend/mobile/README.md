# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Prerequisite / Get started
1. Sgin up and Login [`Ngrok`](https://ngrok.com)
2. [`Download Ngrok`](https://ngrok.com/download) in your local
3. Go to your Ngrok dashboard and get your authtoken
3. Add authtoken (E.g., $ ngrok config add-authtoken <token>)
4. run backend server with `flask run --host=0.0.0.0`
5. in another console window, go the same directory as the backend(virtual environment)
5. run ngrok server with `ngrok http http://localhost:5000`
6. In your ngrok console, copy your URL (E.g., `https://0000-000-000-00-000.ngrok-free.app`)
7. Go to `app/ngrok.ts`
8. Replace URL with your URL copied previously
9. Run frontend server with `npx expo run --tunnel`

## Get started
1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
