AOS.init({
  once: false,
  mirror: true,
});

// MOOCs Cards

const moocs = document.querySelector(".moocs");
const moocscards = [
  {
    title: "Udacity AI Fundamentals",
    cardImage: "assets/images/Education-page/Udacity AI Fundamentals.pdf",
    previewImage: "assets/images/Education-page/cert-thumbs/udacity-ai-fundamentals.jpg",
    moocLink: "#",
  },
  {
    title: "Udacity Android Development",
    cardImage: "assets/images/Education-page/Udacity Android dev't.pdf",
    previewImage: "assets/images/Education-page/cert-thumbs/udacity-android-dev.jpg",
    moocLink: "#",
  },
  {
    title: "Udacity Data Analysis",
    cardImage: "assets/images/Education-page/Udacity Data analysis.pdf",
    previewImage: "assets/images/Education-page/cert-thumbs/udacity-data-analysis.jpg",
    moocLink: "#",
  },
  {
    title: "Udacity Programming Fundamentals",
    cardImage: "assets/images/Education-page/Udacity Programing fundamental.pdf",
    previewImage:
      "assets/images/Education-page/cert-thumbs/udacity-programming-fundamentals.jpg",
    moocLink: "#",
  },
  {
    title: "OpenLearn Algorithm Design",
    cardImage:
      "assets/images/Education-page/Open Learn Algorithm Design Certificate.pdf",
    previewImage: "assets/images/Education-page/cert-thumbs/openlearn-algorithm-design.jpg",
    moocLink: "#",
  },
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

function isPdfAsset(assetSrc) {
  return typeof assetSrc === "string" && assetSrc.toLowerCase().endsWith(".pdf");
}

function encodeAssetPath(path) {
  // encodeURI does not encode apostrophes, which can break some asset URLs (e.g. dev't.pdf)
  return encodeURI(path).replace(/'/g, "%27");
}

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
    ({ title, cardImage, previewImage }) => {
      const assetSrc = encodeAssetPath(cardImage);
      const previewSrc = encodeAssetPath(previewImage || cardImage);
      const mediaMarkup = `<img src="${previewSrc}" class="card-img-top content-image" alt="${title}">`;

      output += `        
        <div class="col-6 col-md-3 col-sm-4 column" data-aos="fade-up" data-aos-easing="linear" data-aos-delay="600" >  
            <div class="card mb-3 mx-auto" onclick='showModal(${JSON.stringify(
              assetSrc
            )})' style="cursor: pointer;">
               <div class="content">
                    ${mediaMarkup}
                </div>
                <div class="card-body">
                    <h6 class="mt-0 py-2 text-center font-weight-bold mooc-title" style="font-size:12px;">${title}</h6>
                </div>
            </div>
        </div>        
      `;
    }
  );
  moocs.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards);

/* Modal Logic */
function showModal(imageSrc) {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("img01");
  const modalPdf = document.getElementById("pdf01");
  const captionText = document.getElementById("caption");

  modal.style.display = "block";

  const fileName = (imageSrc || "").split("/").pop() || "";
  captionText.textContent = fileName.replace(/\.(pdf|png|jpg|jpeg)$/i, "");

  if (isPdfAsset(imageSrc)) {
    modalImg.style.display = "none";
    modalImg.src = "";
    modalPdf.style.display = "block";
    modalPdf.src = imageSrc;
  } else {
    modalPdf.style.display = "none";
    modalPdf.src = "";
    modalImg.style.display = "block";
    modalImg.src = imageSrc;
  }
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("img01");
  const modalPdf = document.getElementById("pdf01");
  modal.style.display = "none";

  if (modalImg) modalImg.src = "";
  if (modalPdf) modalPdf.src = "";
}

// Close modal when clicking outside the image
window.onclick = function (event) {
  const modal = document.getElementById("imageModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

