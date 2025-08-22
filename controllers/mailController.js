import mailConfig from "../config/mailConfig.js";

export async function sendInquiryMail(req,res,next) {
    try {
    const {name,email,phone,subject,message} = req.body
      const mailOptions={
        from:process.env.EMAIL_USER,
        to:process.env.RECEIVER_EMAIL,
        subject:"New Inquiry from ShoppyX Website",
        html:`
        <h2>New Inquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong> ${message}</p>
        `
      }
      const data = await mailConfig.sendMail(mailOptions)
    //   console.log(data)
      res.status(200).json({
        status:"success",
        message:"Message sent successfully"
      })
    } catch (err) {
        next(err)
    }
}