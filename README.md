# 💰🤖 october-eu-bot

Semi-automated lending bot for the October.eu platform

- [Usage](#usage)
  - [With the CLI](#with-the-cli)
  - [Hosted on Firebase](#hosted-on-firebase)
- [Strategies](#strategies)
  - [Threshold](#threshold)

---

## Usage

### With the CLI

Create an `.env` file based on `.env.example` and complete it with your October credentials and the [strategy](#strategies). Then run:

```
npm run cli
```

#### How it works

1. When running the CLI, it will check for available projects on October
2. If available projects are found, it will use a user-defined [strategy](#strategies) to compute if it should lend to the projects, and how much
3. If the strategy wants to lend to projects, it will secure the user session (2FA from October sending a code by SMS) and wait
4. The user will enter the code they received in the console prompt
5. The CLI will then make the lending requests to October

### Hosted on Firebase

**1. Create a firebase project**

- Go to https://firebase.google.com
- Click on "Get Started"
- Click on "Add project"
- Choose **a project name** _(You will use it for the next steps)_
- Click on "Continue"
- Disable Google Analytics
- Click on "Create project"

When your arrive in your project dashboard, go to "Database" and select the **"Realtime database"**

**2. Configure IFTTT actions**

- **Create action "Check October.eu every hour"**

  - Go to https://ifttt.com/create
  - For "This", choose "Date & Time"
  - Choose "Every hour at" and "00"
  - Click on "Create trigger"
  - For "That", choose "Webhooks"
  - Choose "Make a web request"
  - Fill with the following:
    - URL: https://europe-west1-[your-project-name].cloudfunctions.net/runStrategy
    - Method: GET
    - Content-Type: _(Keep empty)_
    - Body: _(Keep empty)_
  - Click on "Create action"
  - Disable "Receive notification"
  - Click on "Finish"

- **Create action "Send email with summary of strategy"**

  - Got to https://ifttt.com/create
  - For "This", choose "Webhooks"
  - Choose "Receive a web request"
  - Write "october_eu_bot_summary"
  - Click on "Create trigger"
  - For "That", choose "Email"
  - Choose "Send me an email"
  - Fill with the following:
    - Subject: October.eu bot
    - Body: `{{Value1}}<br/>{{Value2}}<br/>{{Value3}}`
  - Click on "Create action"
  - Disable "Receive notification"
  - Click on "Finish"

- **Retrieve API key**
  - Go to https://ifttt.com/maker_webhooks
  - Click on "Documentation"
  - **Copy the key for the next step**

**3. Create env file**

Create an `.env` file based on `.env.example` and complete it.

**4. Deploy to firebase**

```
firebase use --add [your-project-name]
npm run deploy
```

**5. Wait for a project to be available**

Now, wait for a new project to be available on october. If the project is available and is chosen by the [strategy](#strategies), you should receive an SMS with a code: Go to https://[your-project-id].web.app and fill your password and the code. After a few seconds, you should receive an email with the summary of the strategy actions!

> Note: There is a 9min timeout on the firebase function to retrieve the code. Be quick!

#### How it works

1. Every hours, an IFTTT action calls a firebase function
2. This firebase function checks for available projects on October
3. If available projects are found, it will use a user-defined strategy to compute if it should lend to the projects, and how much
4. If the strategy wants to lend to projects, it will secure the user session (2FA from October sending a code by SMS) and wait
5. The user will have to go to a webpage to enter the code they received
6. Once the code is available to the firebase function, it will make the lending requests to October
7. Every time a lending request is done, it will send a query to IFTTT so that an email is sent to the user to notify if it was successful or not

> Note: Since the firebase functions are making external requests, you need to have the Blaze (pay as you go) pricing plan. However, the functions are entirely within the free quotas and you should not expect to pay anything.

---

## Strategies

### Threshold

This strategy will lend `amount`€ to any available projects that have a rate >= `rate`%.

Syntax:

```
THRESHOLD(rate,amount)

# Example
THRESHOLD(7,50) # Lend 50€ to all projects with rate >= 7%
```
