import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "About Us - All In One Calculator",
  description: "About All In One Calculator, our team, contact information, terms of use, and privacy policy.",
};

const contentHtml = `<p>We are a group of IT professionals enthusiastic in creating quality free tools and content on the Internet. The main purpose of this website is to provide a comprehensive collection of free online calculators for ease of public use. This site was launched on calculators.info first in 2007. In 2008, we migrated to all in one calculator.</p>
<p>The calculators on this site were grouped into 4 sections: <a href="/financial-calculator">financial</a>, <a href="/fitness-and-health-calculator">fitness &amp; health</a>, <a href="/math-calculator">math</a>, and <a href="/other-calculator">others</a>. All of the calculators were developed in-house. Some calculators use open-source JavaScript components under different open-source licenses. More than 90% of the calculators are based on well-known formulas or equations from textbooks, such as the mortgage calculator, BMI calculator, etc. If formulas are controversial, we provide the results of all popular formulas, as can be seen in the Ideal Weight Calculator. Calculators such as the love calculator that are solely meant for amusement are based on internal formulas. The results of the financial calculators were reviewed by our financial advisors, who work for major personal financial advising firms. The results of the health calculators were reviewed and approved by local medical doctors. More than 99% of the descriptive content was developed in-house with a small amount of content taken from wikipedia.org under the GNU Free Documentation License. The descriptive content of the financial calculators was created and reviewed by our financial team. The descriptive content of the health calculators was reviewed by local medical doctors.</p>
<p>This site is owned and operated by Maple Tech. International LLC.</p>
<br/><h2>Frequently Asked Questions</h2>
<p><b>Q: Can I link from my website to a calculator on all in one calculator?</b><br/>

A: Yes, please feel free to link to any page on all in one calculator.</p>
<p><b>Q: How should I send suggestions or report problems?</b><br/>

A: We appreciate and welcome any suggestions and bug reporting. Please write to us via the form below. If it involves a calculator, please include the URL of the calculator and the parameters you used.</p>
<p><b>Q: Do you have an API for the calculators?</b><br/>

A: Sorry, we do not have an API available.</p>
<p><b>Q: How can I advertise on all in one calculator?</b><br/>

A: Please use Google Ads placement targeting. Please do not try to reach us on advertisement optimization, header bidding, etc.</p>
<a name="data-removal"></a>
<p><b>Q: How do I delete my data from all in one calculator?</b><br/>

A: For registered users, a button is available to delete your entire registration information, saved calculations, and settings after signing in. Alternatively, you can use the 'Contact Us' form below to request the removal of your registration and data. We will process the removal within two business days after verification.</p>
<a name="contact"></a>
<br/>
<h2>Contact Us</h2>
<p>We can be reached via the following form. Normally, we will respond within 2 business days.</p>
<noscript><font color="red"><center><b>This site needs JavaScript enabled to run properly. Please change your browser settings!</b></center></font></noscript>
<form action="about-us.html#contact" method="post" name="contactF">
<table class="bodytext">
<tr>
<td valign="top"><strong>Your name: </strong></td>
<td><input name="name1" size="50" style="width:350px; padding:5px;" type="text" value=""/></td>
</tr>
<tr>
<td valign="top"><strong>Your email: </strong></td>
<td><input name="email1" size="50" style="width:350px; padding:5px;" type="text" value=""/></td>
</tr>
<tr>
<td valign="top"><strong>Message to us:</strong></td>
<td><textarea cols="40" name="message1" rows="8" style="width:350px; padding:5px;"></textarea></td>
</tr>
<tr>
<td><input name="validateID" type="hidden" value="123536"/></td>
<td><input name="Submits" onclick="return validateForm();" style="width:100%; font-size:18px; text-align:center; font-weight:bold; padding:5px;background-image:none;" type="submit" value="Send"/></td>
</tr>
</table>
</form><br/><br/>
<script type="text/javascript">

function validateForm() {document.contactF.validateID.value = String(this.location).toLowerCase();return true;}

</script>
<table width="100%"><tr><td valign="top">
<h3>Mailing Address:</h3>
<p class="bigtext">2203 Timberloch Pl<br/>

Suite 252<br/>

The Woodlands, TX 77380</p>
</td>
<td align="right">
<img src="/img/office.jpg"/>
</td>
</tr>
</table>
<a name="privacy"></a>
<br/><br/>
<h2>Privacy Policy</h2>
<p>Maple Tech International LLC operates the all in one calculator website, which provides the SERVICE.</p>
<p>This page is used to inform website visitors regarding our policies with the collection, use, and disclosure of Personal Information if anyone decided to use our Service.</p>
<p>If you choose to use our Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that we collect is used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.</p>
<p><b>Information Collection and Use</b></p>
<p>We take and respect your privacy seriously. We may collect information via cookie or weblog. This is to customize services and enhance customer satisfaction.</p>
<p>The data we collect are:</p>
<p><b>Log Data</b></p>
<p>We want to inform you that whenever you visit our Service, we collect information that your browser sends to us that is called Log Data. This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser version, pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other statistics.</p>
<p><b>Cookies and Third-Party Advertising</b></p>
<p>Cookies are files with a small amount of data that is commonly used an anonymous unique identifier. These are sent to your browser from the website that you visit and are stored on your computer's hard drive.</p>
<p>Our website uses these "cookies" to collect information and to improve our Service. You have the option to either accept or refuse these cookies, and know when a cookie is being sent to your computer. If you choose to refuse our cookies, you may not be able to use some portions of our Service.</p>
<p>We allow third-party companies to serve ads and/or collect certain anonymous information when you visit our website. These companies may use non-personally identifiable information (e.g., click stream information, browser type, time and date, subject of advertisements clicked or scrolled over) during your visits to this and other Web sites in order to provide advertisements about goods and services likely to be of greater interest to you. These companies typically use a cookie or third-party web beacon to collect this information. To learn more about this behavioral advertising practice or to opt-out of this type of advertising, please visit optout.networkadvertising.org.</p>
<p><b>Web Forms on Our Site</b></p>
<p>The information you fill and submit by the web forms on our site enables the calculators to function.</p>
<p><b>Security</b></p>
<p>We value your trust in providing us your Personal Information. Thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the Internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.</p>
<p><b>Links to Other Sites</b></p>
<p>Our Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over, and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
<p><b>Children's Privacy</b></p>
<p>Our Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to take the necessary actions.</p>
<p><b>Changes to This Privacy Policy</b></p>
<p>We reserve the right to update this privacy policy with or without notice. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted on this page.</p>
<a name="terms"></a>
<br/><br/>
<h2>Terms of Use</h2>
<p><b>Acceptance of Terms</b></p>
<p>Maple Tech International LLC. ("Company") provides this website at all in one calculator (referred to hereafter as "the Website") for use by consumers and businesses. By using the Website in any way, you are agreeing to comply with the Terms of Use. Should you object to any term or condition of the Terms of Use or any guideline of the Website, your only recourse is to immediately discontinue use of the Website.</p>
<p><b>Changes to the Terms of Use</b></p>
<p>We reserve the right, at our sole discretion, to change, modify, or alter the Terms of Use at any time. Such changes shall become effective immediately upon the posting thereof. The most current version of the Terms of Use will be linked from the footer of the Website. You must review the Terms of Use on a regular basis to keep yourself apprised of any changes.</p>
<p><b>Conduct</b></p>
<p>You agree not to post any text, files, images, video, audio, or other materials ("Content") or use the Website in any way that:</p>
<ul>
<li>infringes any patent, trademark, trade secret, copyright, or other proprietary rights of any party;</li>
<li>violates any state, federal, or other law;</li>
<li>threatens, harasses, or is libelous;</li>
<li>is harmful to minors;</li>
<li>contains self-benefiting advertising or marketing in public areas of the Website that have not been paid for and are not designated for the addition of promotional content;</li>
<li>produces Software viruses or code harmful to other computers;</li>
<li>disrupts the normal dialogue of users of the Website;</li>
<li>employs misleading or false information;</li>
<li>uses forged headers or other items to manipulate identifiers in order to disguise the origin of Content.</li>
</ul>
<p>You agree not to decompile or reverse engineer or otherwise attempt to discover any source code contained in the Website.</p>
<p>Unless you receive explicit permission, you agree not to reproduce, duplicate, copy, sell, resell, or exploit for any commercial purposes, any aspect of the Website. Any business that registers with a listing or purchases advertising or any other service ("Customer") has the right and permission to manage their listing or purchased advertising or other services to their commercial benefit so long as the codes of conduct above are not violated.</p>
<p><b>Privacy</b></p>
<p>Please review our Privacy Policy for details on the Company's collection, disclosure, and use of personally identifiable information and privacy matters. Use of the Website is based on your agreement to the Privacy Policy and Terms of Use.</p>
<p><b>Content</b></p>
<p>This Website and some of the Content on this Website contain links to other resources on the Internet. Such links are provided as aids to assist you in identifying and locating other Internet resources that may be of interest to you, and are not intended to state or imply that Company sponsors, endorses, are affiliated or associated with, or are legally authorized to use any trade name, registered trademark, logo, legal or official seal, or copyrighted symbol that may be reflected in said links.</p>
<p>Information or calculation results at our Website may be outdated due to the date and the method of the collection or may be incorrect. If you find information or calculation results on the Website that you believe to be in error, please contact us with the specifics and we will investigate the matter and where we are allowed by our data source we will update the information.</p>
<p><b>Limitations and Termination</b></p>
<p>Company may create limitations of your use of the Website including, but not limited to, the number of times you may access the Website. Limitations can include full termination of your access to the Website and you agree that Company has the right at any time, in its sole discretion, with or without notice, to modify or discontinue the Website (or any part thereof).</p>
<p><b>Disclaimer of Warranties</b></p>
<p>THE COMPANY WEBSITE AND ANY INCLUDED SERVICES ARE PROVIDED ON AN "AS IS" BASIS, WITHOUT ANY WARRANTIES OF ANY KIND, INCLUDING WITHOUT LIMITATION THE WARRANTIES THAT IT IS FREE OF DEFECTS, ERRORS, VIRUSES, MERCHANTABLE AND THAT IT IS FIT FOR A PARTICULAR PURPOSE OR NON-INFRINGING. YOUR USE OF THE WEBSITE IS AT YOUR OWN RISK.</p>
<p><b>Limitations of Liability</b></p>
<p>UNDER NO CIRCUMSTANCES SHALL THE COMPANY BE LIABLE FOR DIRECT, INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES, RESULTING FROM ANY ASPECT OF YOUR USE OF THE WEBSITE INCLUDING BUT NOT LIMITED TO DAMAGES THAT ARISE FROM YOUR INABILITY TO USE THE WEBSITE OR THE SERVICE, OR THE INTERRUPTION, MODIFICATION, OR TERMINATION OF THE WEBSITE OR ANY SERVICE OR PART THEREOF.</p>
<p><b>Jurisdiction</b></p>
<p>The Terms of Use shall be governed by the laws of the State of Texas without regard to its conflict of law provisions. You and Company agree to submit to the personal and exclusive jurisdiction of the courts located within the State of Texas.</p>
<p><b>Partial Invalidity</b></p>
<p>Any provision of this Terms of Use which is found to be invalid or unenforceable by any court in any jurisdiction shall not affect the validity or enforceability of the provision in other jurisdictions and shall not affect the validity or enforceability of the remaining provisions. The waiver or failure of the Company to exercise in any respect any right provided for in this Terms of Use shall not be deemed a waiver of any further right under this Agreement.</p>
<p><b>Violation of Terms</b></p>
<p>You agree that monetary damages may not be a sufficient remedy for any breach of this Agreement and that Company shall be entitled, without waiving any other rights or remedies, to seek injunctive or equitable relief as may be deemed proper by a court of competent jurisdiction.</p>
<p><b>General</b></p>
<p>The Terms of Use constitute the entire agreement between you and Company and govern your use of the Website, superseding any prior agreements between you and Company.</p>`;

export default function Page() {
  return (
    <>
      <div id="clear"></div>
      <div id="contentout">
        <div id="content">
          <div id="breadcrumbs">
            <Link href="/">home</Link> / <span>about us</span>
          </div>
          <h1>About Us</h1>
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
        <Sidebar category="financial" categoryTitle="Financial Calculators" />
      </div>
      <div id="clear"></div>
      <div className="topNavAbs">
        <Link href="/financial-calculator" className="">Financial</Link>
        <Link href="/fitness-and-health-calculator" className="">Fitness &amp; Health</Link>
        <Link href="/math-calculator" className="">Math</Link>
        <Link href="/other-calculator" className="">Other</Link>
      </div>
    </>
  );
}
