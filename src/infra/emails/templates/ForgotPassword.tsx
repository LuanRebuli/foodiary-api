import { Body } from "@react-email/body";
import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Heading } from "@react-email/heading";
import { Html } from "@react-email/html";
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Text } from "@react-email/text";
import React from "react";

interface IForgotPasswordProps {
  user: string;
  confirmationCode: string;
}

export default function ForgotPassword({
  user,
  confirmationCode,
}: IForgotPasswordProps) {
  return (
    <Html>
      <Head />
      <Preview>Recupere sua conta foodiary</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>🥝 foodiary</Heading>
          </Section>

          <Section style={content}>
            <Heading style={title}>Recuperação de Senha</Heading>

            <Text style={text}>Olá {user},</Text>

            <Text style={text}>
              Recebemos uma solicitação para redefinir a senha da sua conta
              foodiary.
            </Text>

            <Text style={text}>
              Para redefinir sua senha, use o código de verificação abaixo:
            </Text>

            <Section style={codeContainer}>
              <Text style={codeText}>{confirmationCode}</Text>
            </Section>

            <Text style={text}>
              Se você não solicitou essa alteração, por favor ignore este email.
              Sua senha permanecerá inalterada.
            </Text>

            <Text style={footer}>
              Atenciosamente,
              <br />
              Equipe foodiary 🥝
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

ForgotPassword.PreviewProps = {
  user: "Luan Rebuli",
  confirmationCode: "123456",
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "32px 20px",
  textAlign: "center" as const,
  backgroundColor: "#4ade80",
};

const logo = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#ffffff",
  margin: "0",
};

const content = {
  padding: "0 48px",
};

const title = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#1a1a1a",
  marginTop: "32px",
  marginBottom: "24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#484848",
  marginBottom: "16px",
};

const codeContainer = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
  textAlign: "center" as const,
  border: "2px dashed #4ade80",
};

const codeText = {
  fontSize: "32px",
  fontWeight: "bold",
  color: "#1a1a1a",
  letterSpacing: "4px",
  margin: "0",
};

const footer = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#484848",
  marginTop: "32px",
};
