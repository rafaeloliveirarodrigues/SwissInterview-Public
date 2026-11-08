import * as React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  deleteDate?: string
}

const InactivityWarning = ({ deleteDate }: Props) => {
  const date = deleteDate ?? 'in about three months'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your Swiss Interview account will be deleted after 24 months of inactivity</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your account will be deleted soon</Heading>
          <Text style={text}>
            You have not used Swiss Interview for 21 months. To protect your privacy, accounts inactive
            for 24 months are deleted automatically with all CVs, interviews and reports. Planned deletion: {date}.
          </Text>
          <Text style={text}>Sign in before then to keep your account. Otherwise, no action is needed.</Text>
          <Button href="https://swissinterview.com/auth" style={button}>Sign in to keep my account</Button>
          <Hr style={hr} />
          <Text style={small}>
            DE: Du hast Swiss Interview seit 21 Monaten nicht genutzt. Inaktive Konten werden nach 24 Monaten mit allen
            Daten gelöscht (geplant: {date}). Melde dich an, um dein Konto zu behalten.
          </Text>
          <Text style={small}>
            FR : Vous n’avez pas utilisé Swiss Interview depuis 21 mois. Les comptes inactifs sont supprimés après 24 mois
            avec toutes leurs données (prévu : {date}). Connectez-vous pour conserver votre compte.
          </Text>
          <Text style={small}>
            IT: Non usi Swiss Interview da 21 mesi. Gli account inattivi vengono eliminati dopo 24 mesi con tutti i dati
            (previsto: {date}). Accedi per mantenere il tuo account.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: InactivityWarning,
  subject: 'Your Swiss Interview account will be deleted soon',
  displayName: 'Inactive account warning',
  previewData: { deleteDate: '15 January 2027' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Manrope, Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 'bold', color: '#14213d', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6', margin: '0 0 16px' }
const small = { fontSize: '13px', color: '#666666', lineHeight: '1.5', margin: '0 0 10px' }
const button = { backgroundColor: '#14213d', color: '#ffffff', borderRadius: '8px', padding: '12px 20px', fontSize: '15px', textDecoration: 'none' }
const hr = { borderColor: '#e5e5e5', margin: '24px 0' }
