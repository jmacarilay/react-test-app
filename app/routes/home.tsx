import { Link } from "react-router";

export default function Home() {
  // const devURL = () => {
  //   const queryParams = new URLSearchParams({
  //     page: "redirect",
  //     code: "ariel-campaign-2025",
  //     type: "referrals",
  //   }).toString();

  //   const path = "pages/redirect/redirect?" + queryParams;

  //   // parse as URL encoded
  //   const encodedPath = encodeURIComponent(path);
    
  //   const baseURL = "https://gcashdev.page.link/?link=";
  //   const redirectURL = "https://gcash.splashscreen/?redirect=gcash%3A%2F%2Fcom.mynt.gcash%2Fapp%2F006300121300%3FappId%3D2170020233750696%2526page%253D";
  //   const finalParams = "&apn=com.globe.gcash.android.uat&ibi=xyz.mynt.gcashdev";

  //   return baseURL + encodeURIComponent(redirectURL) + encodedPath + finalParams;
  // }

  // console.log("Dev URL:", devURL());

  return (
    <div>
      <Link to="https://gcashdev.page.link/?link=https%3A%2F%2Fgcash.splashscreen%2F%3Fredirect%3Dgcash%3A%2F%2Fcom.mynt.gcash%2Fapp%2F006300121300%3FappId%3D2170020233750696%2526page%253Dpages%252Fredirect%252Fredirect%253Ftype%253Dreferrals%2526query%253Dcode%253Dariel-campaign-2025&apn=com.globe.gcash.android.uat&ibi=xyz.mynt.gcashdev">Click to Mini Program DEV</Link><br />

      <Link to="https://gcashdev.page.link/?link=https%3A%2F%2Fgcash.splashscreen%2F%3Fredirect%3Dgcash%3A%2F%2Fcom.mynt.gcash%2Fapp%2F006300121300%3FappId%3D2170020233750696%2526page%253Dpages%252Fredirect%252Fredirect%253Fparams%253Dreferrals|ariel-campaign-2025&apn=com.globe.gcash.android.uat&ibi=xyz.mynt.gcashdev">Click to Mini Program DEV 1 params only</Link><br />

      <Link to="https://gcashdev.page.link/?link=https://gcash.splashscreen/?redirect=gcash%3A%2F%2Fcom.mynt.gcash%2Fapp%2F006300121300%3FappId%3D2170010104980149%2526page%253Dpages%252Fredirect%252Fredirect%253FselectedProduct%253Dabc%2526query%253DdiscountCode%253Dxyz&apn=com.globe.gcash.android.uat&ibi=xyz.mynt.gcashdev">Gcash sample URL</Link><br />

      <Link to="https://gcashdev.page.link/?link=https://gcash.splashscreen/?redirect=gcash%3A%2F%2Fcom.mynt.gcash%2Fapp%2F006300121300%3FappId%3D2170020233750696%2526page%253Dpages%252Fredirect%252Fredirect%253Fcode%253Dabc&apn=com.globe.gcash.android&isi=520020791&ibi=com.globetel.gcash">Click to Mini Program PROD</Link>
    </div>
  );
}