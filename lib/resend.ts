import { Resend } from "resend"

let _resend: Resend | null = null

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export async function sendCourseApprovedEmail(
  teacherEmail: string,
  teacherName: string,
  courseTitle: string
) {
  await getResend().emails.send({
    from: "courses@yourdomain.com",
    to: teacherEmail,
    subject: `🎉 Your course "${courseTitle}" has been approved!`,
    html: `
      <h2>Congratulations, ${teacherName}!</h2>
      <p>Your course <strong>"${courseTitle}"</strong> has been approved and is now live on the platform.</p>
      <p>Students can now discover and enroll in your course.</p>
      <p>Thank you for contributing to our learning community!</p>
    `,
  })
}

export async function sendCourseRejectedEmail(
  teacherEmail: string,
  teacherName: string,
  courseTitle: string,
  reason?: string
) {
  await getResend().emails.send({
    from: "courses@yourdomain.com",
    to: teacherEmail,
    subject: `Course "${courseTitle}" was not approved`,
    html: `
      <h2>Hello, ${teacherName}</h2>
      <p>Unfortunately, your course <strong>"${courseTitle}"</strong> was not approved at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>Please review our content guidelines and resubmit after making the necessary changes.</p>
      <p>If you have any questions, please contact our support team.</p>
    `,
  })
}

export async function sendCourseSubmittedEmail(
  teacherEmail: string,
  teacherName: string,
  courseTitle: string
) {
  await getResend().emails.send({
    from: "courses@yourdomain.com",
    to: teacherEmail,
    subject: `Course "${courseTitle}" submitted for review`,
    html: `
      <h2>Hello, ${teacherName}!</h2>
      <p>Your course <strong>"${courseTitle}"</strong> has been submitted for admin review.</p>
      <p>We will notify you once the review is complete (usually within 24-48 hours).</p>
      <p>Thank you for creating content on our platform!</p>
    `,
  })
}
