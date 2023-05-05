AOS.init();

//  Work experience cards

const experiencecards = document.querySelector(".experience-cards");
const exp = [
  {
    title: "Mihretab Nigatu",
    cardImage: "assets/images/About-page/me.jpg",
    place: "Fronted Developer",
    time: "(2020 - present)",
    desp: "Hi there, I'm Mihretab Nigatu, a passionate Frontend Developer with a keen eye for detail and a strong desire to create engaging user experiences. I believe that the key to building successful websites and applications is to understand the needs of the end-users and to design with them in mind. With several years of experience under my belt, I have honed my skills in a variety of programming languages such as HTML, CSS, and JavaScript, and I have also become proficient in using popular frontend frameworks such as React, Vue.js, and Angular. In addition to my technical abilities, I am also a great team player with excellent communication skills. I enjoy collaborating with others to bring ideas to life and I always strive to exceed expectations.If you're looking for a dedicated frontend developer who is passionate about creating high-quality user experiences, then look no further. I would love the opportunity to work with you and help bring your vision to life.",
  },
  
];

const showCards2 = () => {
  let output = "";
  exp.forEach(
    ({ title, cardImage, place, time, desp }) =>
      (output += `        
    <div class="col gaap" data-aos="fade-up" data-aos-easing="linear" data-aos-delay="100" data-aos-duration="400"> 
      <div class="card card1">
        <img src="${cardImage}" class="featured-image"/>
        <article class="card-body">
          <header>
            <div class="title">
              <h3>${title}</h3>
            </div>
            <p class="meta">
              <span class="pre-heading">${place}</span><br>
              <span class="author">${time}</span>
            </p>
            <ol>
              ${desp}
            </ol>
          </header>
        </article>
      </div>
    </div>
      `)
  );
  experiencecards.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards2);

// Volunteership Cards

const volunteership = document.querySelector(".volunteership");
const volunteershipcards = [
  {
    title: "Google Developers",
    cardImage: "assets/images/About-page/Certificates/Google-Developers.jpg",
    description:
      "The Google Developer Certificate for Web Development is a credential that validates proficiency in building and designing dynamic websites and applications using modern web technologies.",
  },
  
  {
    title: "Codingal",
    cardImage: "assets/images/About-page/Certificates/codingal.png",
    description:
      "Codingal's web development online class provides a comprehensive learning experience, culminating in a valuable certificate that showcases your proficiency in the subject.",
  },
  {
    title: "Great Learning",
    cardImage: "assets/images/About-page/Certificates/Great-learning.png",
    description:
      "Great Learning's certificate in web AI development for creating chatbots through their online class is a valuable asset for anyone seeking to advance their skills in the field.",
  },
  {
    title: "Code Jika",
    cardImage: "assets/images/About-page/Certificates/Code-jika.jpg",
    description:
      "Code Jika offers a 14-day in-person class on web development, which results in a certificate upon completion.",
  },
];

const showCards = () => {
  let output = "";
  volunteershipcards.forEach(
    ({ title, cardImage, description }) =>
      (output += `        
      <div class="card volunteerCard" data-aos="fade-down" data-aos-easing="linear" data-aos-delay="100" data-aos-duration="600" style="height: 550px;width:400px">
      
      <img src="${cardImage}" height="250" width="65" class="card-img" style="border-radius:10px">
      <div class="content">
          <h2 class="volunteerTitle">${title}</h2><br>
          <p class="copy">${description}</p></div>
      
      </div>
      `)
  );
  volunteership.innerHTML = output;
};
document.addEventListener("DOMContentLoaded", showCards);
