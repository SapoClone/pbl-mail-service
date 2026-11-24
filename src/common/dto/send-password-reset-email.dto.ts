import { Equals, IsEmail, IsUrl } from "class-validator";

/** Queued by pbl-api when someone asks for a password reset; `url` is the full link to the web app. */
export class SendPasswordResetEmailDto {
  @Equals("password-reset")
  type: "password-reset";

  @IsEmail()
  email: string;

  @IsUrl({
    require_tld: false,
    require_protocol: true,
    protocols: ["http", "https"],
  })
  url: string;
}
