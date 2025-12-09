Group 11's Volunteer Matchmaking website is a full-stack web application framework that integrates a scalable backend using React for the frontend to support event management, matching, and report generation for volunteer and event insights. It emphasizes modularity, real-time updates, and comprehensive testing to ensure reliability and maintainable code. 

This project for our group's Software Design class simplifies the development of full-stack web platforms focused on engagement and ease of Volunteers contributing easily to community driven events all over Houston.

In order to run the website, first clone the repository:

```bash
> git clone https://github.com/Bahar-design/group11project 
```

Then navigate to the project depository:

```bash
> cd group11project
```

Now install the dependencies:

Using npm:

```bash
> npm install
```

now open the terminal and navigate to the backend folder:


```bash
> cd backend
```

and then run the backend

```bash
> ~/Documents/group11project/backend$ node app.js
```

You should see: Backend server running on port 4000

And to run tests within the backend folder, use the following command:

```bash
> ~/Documents/group11project/backend$ npm test
```

Then open another terminal besides the first one, and navigate to the frontend folder:

```bash
> cd frontend
```

and then run the frontend

```bash
> ~/Documents/group11project/frontend$ npm run dev
```

App.js should automatically show the homepage 


**Note:**  The frontend fetches backend dynamically using the .env variable.

