import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingUp, Trophy } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-6 py-4 flex justify-between items-center bg-white border-b border-slate-100">
        <div className="font-bold text-2xl text-blue-600 tracking-tight">Progresso 30</div>
        <div className="gap-4 flex">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 font-medium">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 font-semibold shadow-md">Começar Grátis</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-8">
          <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 px-4 py-1 text-sm">
            Transforme sua vida em 30 dias
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight">
            Seu progresso diário, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">gamificado.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Crie hábitos duradouros, participe de desafios de 30 dias, acumule pontos e troque por recompensas exclusivas criadas por você mesmo.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xl shadow-slate-200">
                Criar minha conta <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 pt-16">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Check-in Diário</h3>
              <p className="text-slate-500 text-sm">Marque seus hábitos todos os dias e não perca sua ofensiva.</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Planos de 30 Dias</h3>
              <p className="text-slate-500 text-sm">Desafios prontos para te ajudar a focar na saúde, trabalho e finanças.</p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="h-16 w-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Loja de Prêmios</h3>
              <p className="text-slate-500 text-sm">Use seus pontos acumulados para resgatar recompensas pessoais.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Para usar o Badge aqui
import { Badge } from "@/components/ui/badge";
