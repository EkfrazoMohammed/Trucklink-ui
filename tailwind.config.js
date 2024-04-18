/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      LightFont: ["LightFont", "Montserrat-Thin"],
      RegularFont: ["RegularFont", "Montserrat-Regular"],
      BoldFont: ["BoldFont", "Montserrat-Bold"],
    },
    extend: {
      colors: {
        primaryButton:"#03B9E7",
        primaryColor: "#2D2D56",
        secondaryColor: "#ECEBEB",
        tertiaryColor: "#FEC737",
        greyColor: "#D9D9D9",
        greyColor2: "#ECEBEB",
        greyColor3: "#D2D2D2"
      },
      backgroundImage: {
        'welcomePage': "url('https://d2nahbmqd5vvug.cloudfront.net/appdata/Welcome+screen+desktop+1.png')",
      }
    },
  },
  plugins: [],
};
