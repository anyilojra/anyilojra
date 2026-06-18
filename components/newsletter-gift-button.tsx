"use client"

import { useState } from "react"
import { subscribeNewsletter } from "@/lib/supabase-newsletter"

type Step = "form" | "success" | "already"

export function NewsletterGiftButton() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>("form")
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [accepted, setAccepted] = useState(false)

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    gender: "",
  })

  function handleOpen() {
    setOpen(true)
    setStep("form")
    setErrorMsg("")
    setAccepted(false)
    setForm({ first_name: "", last_name: "", email: "", gender: "" })
  }

  function handleClose() {
    setOpen(false)
  }

  async function handleSubmit() {
    setErrorMsg("")
    if (!form.first_name || !form.last_name || !form.email) {
      setErrorMsg("Por favor completa todos los campos requeridos.")
      return
    }
    if (!accepted) {
      setErrorMsg("Debes aceptar las políticas de privacidad.")
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.email)) {
      setErrorMsg("Ingresa un correo electrónico válido.")
      return
    }
    setLoading(true)
    const { code: discountCode, error } = await subscribeNewsletter(form)
    setLoading(false)
    if (error) {
      if (error.includes("ya tiene un código")) {
        setStep("already")
      } else {
        setErrorMsg(error)
      }
      return
    }
    setCode(discountCode!)
    setStep("success")
  }

  return (
    <>
      <button
        onClick={handleOpen}
        aria-label="Obtén tu descuento de bienvenida"
        style={{ position: "fixed", bottom: "88px", right: "24px", zIndex: 50, width: "56px", height: "56px", borderRadius: "9999px", backgroundColor: "#b5c4a8", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.18)", transition: "transform 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span style={{ position: "absolute", top: "-4px", right: "-4px", width: "18px", height: "18px", borderRadius: "9999px", backgroundColor: "#e53e3e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold", color: "white" }}>
          %
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="26" height="26">
          <path d="M20 7h-2.151A3.986 3.986 0 0 0 18 5a4 4 0 0 0-7.192-2.4A3.986 3.986 0 0 0 8 1a4 4 0 0 0-2.851 6.784C4.457 8.046 4 8.496 4 9v2a1 1 0 0 0 1 1h1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8h1a1 1 0 0 0 1-1V9c0-.504-.457-.954-1.149-1.216zM14 3a2 2 0 1 1 0 4h-2V5a2 2 0 0 1 2-2zM8 3a2 2 0 0 1 2 2v2h-2a2 2 0 1 1 0-4zm-2 8V9h5v2H6zm1 2h4v7H7v-7zm6 7v-7h4v7h-4zm4-9h-5V9h5v2z" />
        </svg>
      </button>

      {open && (
        <div onClick={handleClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "white", borderRadius: "12px", overflow: "hidden", width: "100%", maxWidth: "760px", display: "flex", flexDirection: "row", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", maxHeight: "90vh" }}>

            <div style={{ flex: "0 0 42%", backgroundImage: "url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80')", backgroundSize: "cover", backgroundPosition: "center top" }} />

            <div style={{ flex: 1, padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto", fontFamily: "var(--font-lora), Georgia, serif", position: "relative" }}>

              <button onClick={handleClose} aria-label="Cerrar" style={{ position: "absolute", top: "14px", right: "14px", background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#5c4a3a", lineHeight: 1 }}>
                ✕
              </button>

              {step === "form" && (
                <>
                  <p style={{ margin: "0 0 4px", fontSize: "15px", color: "#5c4a3a" }}>suscríbete y recibe</p>
                  <h2 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: "700", color: "#1a0a00", fontFamily: "var(--font-playfair), serif" }}>15% DE DESCUENTO</h2>
                  <p style={{ margin: "0 0 24px", fontSize: "14px", color: "#5c4a3a" }}>en tu primera compra</p>

                  <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                    <input type="text" placeholder="Nombres" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} style={inputStyle} />
                    <input type="text" placeholder="Apellidos" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} style={inputStyle} />
                  </div>

                  <input type="email" placeholder="Correo electrónico" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ ...inputStyle, width: "100%", marginBottom: "12px" }} />

                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} style={{ ...inputStyle, width: "100%", marginBottom: "16px", color: form.gender ? "#1a0a00" : "#9e8c7d" }}>
                    <option value="" disabled>Sexo</option>
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                    <option value="otro">Prefiero no decir</option>
                  </select>

                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "20px", fontSize: "12px", color: "#5c4a3a", cursor: "pointer", lineHeight: "1.5" }}>
                    <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} style={{ marginTop: "2px", accentColor: "#c8952a" }} />
                    <span>
                      Acepto las políticas de privacidad y tratamiento de datos personales del sitio y del Programa de Fidelización.{" "}
                      <a href="/terminos" style={{ color: "#c8952a", textDecoration: "underline" }}>Conoce más aquí.</a>
                    </span>
                  </label>

                  {errorMsg && (
                    <p style={{ color: "#c0392b", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>{errorMsg}</p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ width: "100%", padding: "13px", border: "1.5px solid #1a0a00", backgroundColor: loading ? "#e8dfd3" : "white", color: "#1a0a00", fontSize: "13px", letterSpacing: "1.5px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s", marginBottom: "12px" }}
                    onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = "#1a0a00"; e.currentTarget.style.color = "white" } }}
                    onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "#1a0a00" } }}
                  >
                    {loading ? "ENVIANDO..." : "ENVIAR"}
                  </button>

                  <a href="/terminos" style={{ textAlign: "center", fontSize: "11px", color: "#5c4a3a", textDecoration: "underline", letterSpacing: "1px" }}>VER TÉRMINOS Y CONDICIONES</a>
                </>
              )}

              {step === "success" && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
                  <p style={{ fontSize: "15px", color: "#1a0a00", marginBottom: "8px" }}>
                    Formulario enviado<br /><strong>con éxito.</strong>
                  </p>
                  <p style={{ fontSize: "13px", color: "#5c4a3a", marginBottom: "24px" }}>
                    {form.gender === "masculino" ? "Bienvenido" : "Bienvenida"} a nuestra comunidad. Te enviamos tu código de descuento al correo <strong>{form.email}</strong>.
                  </p>
                  <hr style={{ borderColor: "#e8dfd3", marginBottom: "24px" }} />
                  <button
                    onClick={() => { handleClose(); window.location.href = form.gender === "masculino" ? "/hombre" : "/mujer" }}
                    style={{ marginTop: "8px", padding: "13px 32px", border: "1.5px solid #1a0a00", backgroundColor: "white", color: "#1a0a00", fontSize: "13px", letterSpacing: "1.5px", fontWeight: "600", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1a0a00"; e.currentTarget.style.color = "white" }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "#1a0a00" }}
                  >
                    {form.gender === "masculino" ? "VER COLECCIÓN HOMBRE" : "VER COLECCIÓN MUJER"}
                  </button>
                  <br />
                  <a href="/terminos" style={{ fontSize: "11px", color: "#5c4a3a", textDecoration: "underline", letterSpacing: "1px", marginTop: "12px", display: "inline-block" }}>VER TÉRMINOS Y CONDICIONES</a>
                </div>
              )}

              {step === "already" && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎁</div>
                  <h3 style={{ fontFamily: "var(--font-playfair), serif", fontSize: "18px", color: "#1a0a00", marginBottom: "12px" }}>¡Ya eres parte de nuestra comunidad!</h3>
                  <p style={{ fontSize: "13px", color: "#5c4a3a", marginBottom: "24px" }}>Este correo ya tiene un código de descuento asignado. Úsalo en tu carrito de compras:</p>
                  <p style={{ fontSize: "22px", fontWeight: "700", color: "#c8952a", letterSpacing: "3px", marginBottom: "24px" }}>VZ15OFF</p>
                  <button
                    onClick={handleClose}
                    style={{ padding: "13px 32px", border: "1.5px solid #1a0a00", backgroundColor: "white", color: "#1a0a00", fontSize: "13px", letterSpacing: "1.5px", fontWeight: "600", cursor: "pointer" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1a0a00"; e.currentTarget.style.color = "white" }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; e.currentTarget.style.color = "#1a0a00" }}
                  >
                    CERRAR
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "11px 14px",
  border: "1px solid #e8dfd3",
  fontSize: "13px",
  color: "#1a0a00",
  backgroundColor: "white",
  outline: "none",
  fontFamily: "var(--font-lora), Georgia, serif",
}