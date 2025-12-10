AOS.init({
  once: false,
  mirror: true,
});

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
            <div class="card mb-3 mx-auto" onclick="showModal('${cardImage}')" style="cursor: pointer;">
               <div class="content">
                    <img src=${cardImage} class="card-img-top content-image">     
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

/* Modal Logic */
function showModal(imageSrc) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("img01");
  const captionText = document.getElementById("caption");

  modal.style.display = "block";
  modalImg.src = imageSrc;
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
}

// Close modal when clicking outside the image
window.onclick = function (event) {
  const modal = document.getElementById("imageModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

