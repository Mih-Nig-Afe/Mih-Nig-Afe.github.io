AOS.init();

//  Work experience cards

const experiencecards = document.querySelector(".experience-cards");
const exp = [
  {
    title: "Mihretab Nigatu",
    cardImage: "assets/images/About-page/me.jpg",
    place: "Systems Futurist · Full Stack Developer & AI Engineer",
    time: "(2020 - present)",
    desp: "I am Mihretab Nigatu—a Systems Futurist and Full Stack Developer & AI Engineer passionate about building intelligent, scalable digital ecosystems. 🤖 <strong>AI & Machine Learning:</strong> I architect autonomous AI agents and ML-powered solutions that automate complex workflows. From natural language processing to predictive analytics, I leverage cutting-edge AI frameworks to create systems that learn, adapt, and deliver measurable business impact. 📱 <strong>Telegram Bot Development:</strong> I specialize in designing sophisticated Telegram bot ecosystems—building everything from customer service automation and payment integration bots to multi-agent orchestration systems. My bots handle thousands of interactions seamlessly, featuring inline keyboards, webhook integrations, real-time notifications, and AI-powered conversational interfaces. 🌐 <strong>Full Stack Web Engineering:</strong> With 4+ years of hands-on experience, I craft pixel-perfect, responsive web experiences using modern frontend stacks (HTML5, CSS3, JavaScript, React, Vue.js). I build performant, SEO-optimized, and accessible interfaces backed by robust backend systems in Python, PHP, Node.js, and serverless architectures. My portfolio spans e-commerce platforms, school management systems, and enterprise dashboards. 🔧 <strong>Full-Stack & Automation:</strong> I bridge frontend elegance with backend power—integrating RESTful APIs, database systems, CI/CD pipelines, and cloud infrastructure. My automation pipelines streamline deployments and enable continuous delivery. 🎓 Google-certified and constantly evolving, I approach every project with systems thinking, clean architecture principles, and a commitment to delivering resilient, human-centered software. Let's build the future together!",
  },

];

const showCards2 = () => {
  let output = "";
  exp.forEach(
    ({ title, cardImage, place, time, desp }) =>
    (output += `        
    <div class="col gaap" data-aos="fade-up" data-aos-easing="linear" data-aos-delay="100" data-aos-duration="400"> 
      <div class="card card1">
        <img src="${cardImage}" class="featured-image about-portrait" alt="${title} portrait"/>
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
