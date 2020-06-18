const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.contactForm = async (req, res) => {
  const { name, email, message } = req.body;
  const emailData = {
    to: process.env.EMAIL_TO,
    from: email,
    subject: `Contact form - ${process.env.APP_NAME}`,
    text: `Email received from contact form \n name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
    html: `
        <h4>Email received from contact form</h4>
        <p>Sender name: ${name}</p>
        <p>Sender email: ${email}</p>
        <p>Sender message: ${message}</p>
        <hr/>
        <p>This email may contain secsetive information!</p>
        <p>https://seoblog.com</p>
    `,
  };

  await sgMail.send(emailData);

  res.json({ success: true });
};

exports.contactBlogAuthorForm = async (req, res) => {
  const { name, email, message, authorEmail } = req.body;
  const mailList = [authorEmail, process.env.EMAIL_TO];

  const emailData = {
    to: mailList,
    from: email,
    subject: `Someone message you from ${process.env.APP_NAME}`,
    text: `Email received from contact form \n name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
    html: `
        <h4>Message recived from</h4>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Message: ${message}</p>
        <hr/>
        <p>This email may contain secsetive information!</p>
        <p>https://seoblog.com</p>
    `,
  };

  await sgMail.send(emailData);

  res.json({ success: true });
};
