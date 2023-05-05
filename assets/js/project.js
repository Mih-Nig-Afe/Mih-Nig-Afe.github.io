AOS.init();
/* Project Cards */

const projectcards = document.querySelector(".projectcards");

// Array of object for projects
const projects = [
  {
    title: "Portfolio",
    cardImage: "assets/images/project-page/mtab.png",
    description: "My previous Portfolio Website under name of MTAB Development",
    Previewlink: "https://mtabdevelopment.github.io/",
    Githublink: "https://github.com/Mih-Nig-Afe/Portfolio",
  },
  {
    title: "CSPS Website",
    cardImage: "assets/images/project-page/csps.png",
    description: "A School Website Built for Saint Daniel Comboni School Hawassa.",
    Previewlink: "https://mih-nig-afe.github.io/School-Website/",
    Githublink: "https://github.com/Mih-Nig-Afe/School-Website",
  },
  {
    title: "Nord Anglia International School Dubai",
    cardImage: "assets/images/project-page/nord.png",
    description: "Hosted School Website for Nord Anglia International School Dubai with a team of 5 members.",
    Previewlink: "https://www.nordangliaeducation.com/nas-dubai",
    Githublink: "404.html",
  },
  {
    title: "USI, The Pearl",
    cardImage: "assets/images/project-page/usi.png",
    description: "Hosted School Website for United School International and sold for them and customized from my previous project of the CSPS School Web Project",
    Previewlink: "https://unitedschool.qa/",
    Githublink: "404.html",
  },
  {
    title: "Tic Tac Toe Game",
    cardImage: "assets/images/project-page/tic-tac-toe.png",
    description:
      "A Tic Tac Toe Game using Dart Flutter Library.",
    Previewlink: "404.html",
    Githublink: "https://github.com/Mih-Nig-Afe/Flutter-X-O-Game",
  },
  {
    title: "Rose Liquor Store",
    cardImage: "assets/images/project-page/rose.png",
    description: "Ecomerce Website for Rose Liquor store in Hawassa, Ethiopia",
    Previewlink: "https://mih-nig-afe.github.io/Liquor-Store-Web/",
    Githublink: "https://github.com/Mih-Nig-Afe/Liquor-Store-Web",
  },
  {
    title: "Sign up and Sign in",
    cardImage: "assets/images/project-page/Delivery.png",
    description: "Customer Sign up and Sign in page for Delivery company with PHP and SQL including the Database.",
    Previewlink: "404.html",
    Githublink: "https://github.com/Mih-Nig-Afe/Customer-sign-up-and-sign-in",
  },
  {
    title: "Web Chat App UI",
    cardImage: "assets/images/project-page/chat.png",
    description: "Website Based Chat App UI",
    Previewlink: "404.html",
    Githublink: "https://github.com/Mih-Nig-Afe/Web-Chat-App-UI",
  },
  {
    title: "Calculator",
    cardImage: "assets/images/project-page/calculator.jpg",
    description: "A simple Calculator using C++",
    Previewlink: "404.html",
    Githublink: "https://github.com/Mih-Nig-Afe/C-Simple-codes",
  },
  
  {
    title: "Data Accessing ",
    cardImage: "assets/images/project-page/data.png",
    description: "A data fetching Sample Sysytem without external Database is needed. using Python",
    Previewlink: "404.html",
    Githublink: "https://github.com/Mih-Nig-Afe/Data-Accessing-Python",
  },

];

// function for rendering project cards data
const showCards = () => {
  let output = "";
  projects.forEach(({ title, cardImage, Previewlink, Githublink }) => {
    output += `       
        <div class="column skill-card card" style="margin: 15px"data-aos="zoom-in-up" data-aos-easing="linear" data-aos-delay="300" data-aos-duration="600" >
          <div class="wrapper" style="background: url(${cardImage}) center / cover no-repeat;">
            <div class="header">
            </div>
            <div class="data">
              <div class="content">
              <div class="title-div">
                <h1 class="title"><a href="#">${title}</a></h1>
                </div>
            <ul class="menu-content"><br>
                  <li><a href="${Previewlink}" class="social-icon"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 30 28" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-monitor"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg></a></li>
                  <li><a href="${Githublink}" class="social-icon"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="25" viewBox="0 0 30 28" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-github"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>`;
  });
  projectcards.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards);

function myFunction() {
  // Declare variables
  var input, button, i, skillcard, card, title;
  input = document.getElementById("myInput").value;
  input = input.toUpperCase();
  skillcard = document.getElementsByClassName("skill-card");
  card = document.getElementsByClassName("card");
  title = document.getElementsByClassName("title");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < button.length; i++) {
    if (
      button[i].innerHTML.toUpperCase().includes(input) ||
      title[i].innerHTML.toUpperCase().includes(input)
    ) {
      skillcard[i].style.display = "";
      card[i].style.display = "";
    } else {
      skillcard[i].style.display = "none";
      card[i].style.display = "none";
    }
  }
}
