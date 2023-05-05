AOS.init();

// MOOCs Cards

const moocs = document.querySelector(".moocs");
const moocscards = [
  {
    title: "Frontend Website Designing",
    cardImage: "assets/images/Education-page/Cert(7).png",
    moocLink: "https://www.udemy.com/",
  },
  {
    title: "Introduction to Web developmnet",
    cardImage: "assets/images/Education-page/Cert(6).jpg",
    moocLink: "https://www.coursera.org/",
  },
  {
    title: "CSS Essentials",
    cardImage: "assets/images/Education-page/Cert(5).jpg",
    moocLink:
      "https://www.linkedin.com/learning/?trk=learning-serp_nav-header-logo&upsellOrderOrigin=default_guest_learning",
  },
  {
    title: "HTML",
    cardImage: "assets/images/Education-page/Cert(1).jpg",
    moocLink: "http://www.sololearn.com/",
  },
  {
    title: "JavaScript",
    cardImage: "assets/images/Education-page/Cert(9).png",
    moocLink: "http://www.sololearn.com/",
  },
  {
    title: "CSS",
    cardImage: "assets/images/Education-page/Cert(3).png",
    moocLink: "http://www.sololearn.com/",
  },
  {
    title: "Web Development Fundamentals",
    cardImage: "assets/images/Education-page/Cert(2).jpg",
    moocLink: "http://www.sololearn.com/",
  },
  {
    title: "Responsive Web Design",
    cardImage: "assets/images/Education-page/Cert(4).jpg",
    moocLink: "http://www.sololearn.com/",
  },
  
];

let currentItem = 0;

const img = document.getElementById("image");

const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");

window.addEventListener("DOMContentLoaded", function () {
  showExperience();
});

function showExperience() {
  setInterval(function () {
    if (currentItem === experience.length) {
      currentItem = 0;
    }
    const item = experience[currentItem];
    img.src = item.img;
    currentItem++;
  }, 3000);
}

const showCards = () => {
  let output = "";
  moocscards.forEach(
    ({ title, cardImage, moocLink }) =>
      (output += `        
        <div class="col-6 col-md-3 col-sm-4 column" data-aos="fade-up" data-aos-easing="linear" data-aos-delay="600" >  
            <div class="card mb-3 mx-auto">
               <div class="content">
                  <div class="content-overlay"></div>
                    <img src=${cardImage} class="card-img-top content-image">     
                  <div class="content-details fadeIn-bottom">
                    <a href="${moocLink}" target="_blank"><i class="fa fa-info-circle fa-2x" aria-hidden="true" style="color: white;"></i></a>                                   
                  </div>
                </div>
                <div class="card-body">
                    <h6 class="mt-0 py-2 text-center font-weight-bold mooc-title" style="font-size:12px;">${title}</h6>
                </div>
            </div>
        </div>        
      `)
  );
  moocs.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards);

/* Badges*/

/* Timeline Section*/

$(function () {
  window.sr = ScrollReveal();

  if ($(window).width() < 768) {
    if ($(".timeline-content").hasClass("js--fadeInLeft")) {
      $(".timeline-content")
        .removeClass("js--fadeInLeft")
        .addClass("js--fadeInRight");
    }

    sr.reveal(".js--fadeInRight", {
      origin: "right",
      distance: "300px",
      easing: "ease-in-out",
      duration: 800,
    });
  } else {
    sr.reveal(".js--fadeInLeft", {
      origin: "left",
      distance: "300px",
      easing: "ease-in-out",
      duration: 800,
    });

    sr.reveal(".js--fadeInRight", {
      origin: "right",
      distance: "300px",
      easing: "ease-in-out",
      duration: 800,
    });
  }

  sr.reveal(".js--fadeInLeft", {
    origin: "left",
    distance: "300px",
    easing: "ease-in-out",
    duration: 800,
  });

  sr.reveal(".js--fadeInRight", {
    origin: "right",
    distance: "300px",
    easing: "ease-in-out",
    duration: 800,
  });
});
