import { redirect } from "next/navigation";

// El quiz ahora vive embebido en la página principal (sección #quiz).
// Esta ruta queda solo para no romper enlaces guardados o compartidos.
export default function QuizPage() {
  redirect("/#quiz");
}
