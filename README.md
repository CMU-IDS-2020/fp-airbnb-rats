# IDS Final Project: Pixlise+

![demo gif](/readme_assets/pixl.gif)

## Online URL: [https://cmu-ids-2020.github.io/fp-airbnb-rats/](https://cmu-ids-2020.github.io/fp-airbnb-rats/)

- **Team members**:
  - Constance Ye (constany@andrew.cmu.edu)
  - Lukas Hermann (lhermann@andrew.cmu.edu)
  - Nur Yildirim (nyildiri@andrew.cmu.edu)
  - Shravya Bhat (shravyab@andrew.cmu.edu)
- **Track**: Interactive Visualization/Application

## Abstract

## [Link to Paper](/Report.md)

## [Demonstration Video](https://drive.google.com/file/d/1_QGiacQm2zVKVjjAQtvHT8NS_-jSTGu_/view?usp=sharing)

## Setting up the software

### Frontend: 

Required:
- Node

Installing packages: 

```
npm i
``` 

Running:
```
npm run start
```

Building:
```
npm run build
```

### Backend
Installing packages:
```
pip install -r requirements.txt
```
Running:
```
python3 backend2.py
```

If running your own server, be sure to change the backend URL in the Cluster.js file to the new url and port.

## Clustering server rate limitations
We are running the clustering backend on an AWS instance. Because it's a free trail of an instance, it will expire around Janurary 9th, 2021. *The app will continue to work afterwards, but the clustering feature will not work unless you set up your own server.* We are also using a free proxy server service (CORS-anywhere) to forward our CORS requests because otherwise we will get https client to http errors. Due to the limits of free AWS and the free proxy server service, the rate and speed of responses may be limited if the app traffic is very high. 

In this case, we recommend cloning our repository and setting it up locally using the instructions above. Please contact one of the team members with any questions about this.

## Work distribution

Please see [our task assignment spreadsheet](https://docs.google.com/spreadsheets/d/1ObvsKfcrZAta7omCOEnC_HmJAQJEn698Jha5Pph43Yk/edit?usp=sharing) for details on this.

## Process
This application was developed over the course of about a month. We first had an initial meeting with one of our stakeholders, the project lead UX manager at NASA JPL where we gathered resources and learned about the possible problems that we could tackle. After more research into the datasets provided and some brainstorming about possible problem scopes, we presented initial mockups to the UX manager. Based on the feedback, we produced new mockups of 10 possible new interaction models or features and presented them to the co-investigator astrologists, who is a main beneficiary. Their input helped to validate our initial mockups, guide future design decisions and also helped us to prioritize which features to focus on. In the remaining weeks, we built the final application based on these findings.

### Process mockups
Initial sketches
![process1](/readme_assets/process1.png)
First pass at showing comparison
![process2](/readme_assets/process2.png)
10 possible interactions
![process3](/readme_assets/process3.png)

## Special thanks

Thank you to IDS professors Dominic Mortiz and Adam Perer and the TAs for their help!
