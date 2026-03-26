import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Car,
  ChevronRight,
} from 'lucide-angular';
import { ToastService } from '../../core/services/toast.service';

interface ContactForm {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  template: `
    <!-- ── Hero ── -->
    <div
      class="relative overflow-hidden"
      style="background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);"
    >
      <div
        class="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
        style="background: radial-gradient(circle, #34d399, transparent); transform: translate(30%,-30%);"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
        style="background: radial-gradient(circle, #6ee7b7, transparent); transform: translate(-30%,30%);"
      ></div>

      <div class="max-w-7xl mx-auto px-6 py-20 text-center relative z-10">
        <span
          class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          style="background: rgba(52,211,153,0.15); color: #6ee7b7; border: 1px solid rgba(52,211,153,0.25);"
        >
          <lucide-angular
            [img]="icons.MessageSquare"
            size="14"
          ></lucide-angular>
          Support & Contact
        </span>
        <h1
          class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5"
        >
          Une question ? <span style="color:#34d399">Nous sommes là.</span>
        </h1>
        <p
          class="text-lg max-w-xl mx-auto"
          style="color: rgba(209,250,229,0.8);"
        >
          Notre équipe basée à Dakar est disponible pour vous accompagner dans
          votre projet automobile au Sénégal.
        </p>

        <!-- Breadcrumb -->
        <nav
          class="flex items-center justify-center gap-2 mt-8 text-xs font-semibold"
          style="color: rgba(209,250,229,0.6);"
        >
          <a routerLink="/" class="hover:text-white transition-colors"
            >Accueil</a
          >
          <lucide-angular [img]="icons.ChevronRight" size="12"></lucide-angular>
          <span style="color:#6ee7b7">Contact</span>
        </nav>
      </div>
    </div>

    <!-- ── Contact Cards ── -->
    <div class="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-start gap-4 hover:shadow-xl transition-all"
        >
          <div
            class="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0"
          >
            <lucide-angular [img]="icons.MapPin" size="20"></lucide-angular>
          </div>
          <div>
            <p
              class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1"
            >
              Adresse
            </p>
            <p class="text-sm font-bold text-gray-900 leading-snug">
              Plateau, Dakar
            </p>
            <p class="text-xs text-gray-500 mt-0.5">
              Sénégal, Afrique de l'Ouest
            </p>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-start gap-4 hover:shadow-xl transition-all"
        >
          <div
            class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0"
          >
            <lucide-angular [img]="icons.Phone" size="20"></lucide-angular>
          </div>
          <div>
            <p
              class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1"
            >
              Téléphone
            </p>
            <a
              href="tel:+221338200000"
              class="text-sm font-bold text-gray-900 hover:text-primary-600 transition-colors leading-snug block"
            >
              +221 33 820 00 00
            </a>
            <a
              href="tel:+221778200000"
              class="text-xs text-gray-500 hover:text-primary-600 transition-colors mt-0.5 block"
            >
              +221 77 820 00 00 (Mobile)
            </a>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-start gap-4 hover:shadow-xl transition-all"
        >
          <div
            class="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0"
          >
            <lucide-angular [img]="icons.Mail" size="20"></lucide-angular>
          </div>
          <div>
            <p
              class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1"
            >
              Email
            </p>
            <a
              href="mailto:contact&#64;sencarmarket.sn"
              class="text-sm font-bold text-gray-900 hover:text-primary-600 transition-colors leading-snug block"
            >
              contact&#64;sencarmarket.sn
            </a>
            <a
              href="mailto:support&#64;sencarmarket.sn"
              class="text-xs text-gray-500 hover:text-primary-600 transition-colors mt-0.5 block"
            >
              support&#64;sencarmarket.sn
            </a>
          </div>
        </div>

        <div
          class="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-start gap-4 hover:shadow-xl transition-all"
        >
          <div
            class="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0"
          >
            <lucide-angular [img]="icons.Clock" size="20"></lucide-angular>
          </div>
          <div>
            <p
              class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1"
            >
              Horaires
            </p>
            <p class="text-sm font-bold text-gray-900 leading-snug">
              Lun – Ven : 8h – 18h
            </p>
            <p class="text-xs text-gray-500 mt-0.5">Sam : 9h – 13h</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Main Content ── -->
    <div class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-10">
        <!-- Left: Infos supplémentaires -->
        <div class="lg:col-span-2 space-y-8">
          <!-- À propos -->
          <div>
            <div class="flex items-center gap-2 mb-4">
              <lucide-angular
                [img]="icons.Car"
                size="20"
                class="text-primary-600"
              ></lucide-angular>
              <h2 class="text-xl font-extrabold text-gray-900">
                Sen-Car Market
              </h2>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed">
              Premier marketplace automobile du Sénégal, nous connectons
              acheteurs, vendeurs, garages agréés et experts en certification
              pour des transactions sécurisées.
            </p>
          </div>

          <!-- FAQ Rapide -->
          <div>
            <h3 class="text-base font-extrabold text-gray-900 mb-4">
              Questions fréquentes
            </h3>
            <div class="space-y-3">
              <div
                class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <p class="text-sm font-bold text-gray-900 mb-1">
                  Comment publier une annonce ?
                </p>
                <p class="text-xs text-gray-500 leading-relaxed">
                  Créez un compte, accédez à votre Dashboard puis cliquez sur
                  "Nouvelle annonce". Vos véhicules sont publiés après
                  validation par notre équipe.
                </p>
              </div>
              <div
                class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <p class="text-sm font-bold text-gray-900 mb-1">
                  Qu'est-ce que la certification expert ?
                </p>
                <p class="text-xs text-gray-500 leading-relaxed">
                  Un expert agréé inspecte le véhicule et délivre un rapport
                  technique complet garantissant l'état réel du bien avant toute
                  transaction.
                </p>
              </div>
              <div
                class="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <p class="text-sm font-bold text-gray-900 mb-1">
                  Les paiements sont-ils sécurisés ?
                </p>
                <p class="text-xs text-gray-500 leading-relaxed">
                  Oui, toutes les transactions transitent par notre plateforme
                  de paiement certifiée. Vos fonds sont sécurisés jusqu'à la
                  validation finale.
                </p>
              </div>
            </div>
          </div>

          <!-- Réseaux sociaux -->
          <div>
            <h3 class="text-base font-extrabold text-gray-900 mb-4">
              Suivez-nous
            </h3>
            <div class="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <lucide-angular
                  [img]="icons.Facebook"
                  size="18"
                ></lucide-angular>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                class="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center hover:bg-sky-100 transition-all hover:scale-110"
                aria-label="Twitter / X"
              >
                <lucide-angular
                  [img]="icons.Twitter"
                  size="18"
                ></lucide-angular>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                class="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center hover:bg-pink-100 transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <lucide-angular
                  [img]="icons.Instagram"
                  size="18"
                ></lucide-angular>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                class="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-100 transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <lucide-angular
                  [img]="icons.Linkedin"
                  size="18"
                ></lucide-angular>
              </a>
            </div>
          </div>
        </div>

        <!-- Right: Formulaire de contact -->
        <div class="lg:col-span-3">
          <div
            class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 lg:p-10"
          >
            <!-- Success state -->
            <div
              *ngIf="submitted()"
              class="flex flex-col items-center justify-center py-16 text-center"
            >
              <div
                class="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6"
              >
                <lucide-angular
                  [img]="icons.CheckCircle"
                  size="40"
                  class="text-emerald-500"
                ></lucide-angular>
              </div>
              <h3 class="text-2xl font-extrabold text-gray-900 mb-3">
                Message envoyé !
              </h3>
              <p class="text-gray-500 max-w-sm leading-relaxed">
                Merci pour votre message. Notre équipe vous répondra dans les
                meilleurs délais, généralement sous 24 heures ouvrées.
              </p>
              <button
                (click)="resetForm()"
                class="mt-8 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold text-sm
                             hover:bg-primary-700 transition-colors"
              >
                Envoyer un autre message
              </button>
            </div>

            <!-- Form -->
            <form
              *ngIf="!submitted()"
              (ngSubmit)="onSubmit()"
              #contactForm="ngForm"
              novalidate
            >
              <div class="mb-8">
                <h2 class="text-2xl font-extrabold text-gray-900">
                  Envoyez-nous un message
                </h2>
                <p class="text-sm text-gray-500 mt-1">
                  Tous les champs marqués d'un * sont obligatoires.
                </p>
              </div>

              <!-- Nom & Prénom -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label
                    for="prenom"
                    class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Prénom *
                  </label>
                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    [(ngModel)]="form.prenom"
                    required
                    placeholder="Ex. Moussa"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                                focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:bg-white
                                outline-none transition-all"
                    [class.border-red-400]="
                      prenomField?.invalid && prenomField?.touched
                    "
                    #prenomField="ngModel"
                  />
                  <p
                    *ngIf="prenomField?.invalid && prenomField?.touched"
                    class="text-xs text-red-500 mt-1 font-medium"
                  >
                    Le prénom est requis.
                  </p>
                </div>
                <div>
                  <label
                    for="nom"
                    class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Nom *
                  </label>
                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    [(ngModel)]="form.nom"
                    required
                    placeholder="Ex. Diallo"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                                focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:bg-white
                                outline-none transition-all"
                    [class.border-red-400]="
                      nomField?.invalid && nomField?.touched
                    "
                    #nomField="ngModel"
                  />
                  <p
                    *ngIf="nomField?.invalid && nomField?.touched"
                    class="text-xs text-red-500 mt-1 font-medium"
                  >
                    Le nom est requis.
                  </p>
                </div>
              </div>

              <!-- Email & Téléphone -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label
                    for="email"
                    class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    [(ngModel)]="form.email"
                    required
                    email
                    placeholder="vous@exemple.sn"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                                focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:bg-white
                                outline-none transition-all"
                    [class.border-red-400]="
                      emailField?.invalid && emailField?.touched
                    "
                    #emailField="ngModel"
                  />
                  <p
                    *ngIf="emailField?.invalid && emailField?.touched"
                    class="text-xs text-red-500 mt-1 font-medium"
                  >
                    Veuillez saisir un email valide.
                  </p>
                </div>
                <div>
                  <label
                    for="telephone"
                    class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                  >
                    Téléphone
                  </label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    [(ngModel)]="form.telephone"
                    placeholder="+221 77 000 00 00"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                                focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:bg-white
                                outline-none transition-all"
                  />
                </div>
              </div>

              <!-- Sujet -->
              <div class="mb-5">
                <label
                  for="sujet"
                  class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                >
                  Sujet *
                </label>
                <select
                  id="sujet"
                  name="sujet"
                  [(ngModel)]="form.sujet"
                  required
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                               focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:bg-white
                               outline-none transition-all appearance-none"
                  [class.border-red-400]="
                    sujetField?.invalid && sujetField?.touched
                  "
                  #sujetField="ngModel"
                >
                  <option value="" disabled>— Sélectionnez un sujet —</option>
                  <option value="ACHAT_VENTE">Achat / Vente de véhicule</option>
                  <option value="CERTIFICATION">Certification Expert</option>
                  <option value="LOCATION">Location de véhicule</option>
                  <option value="REPRISE">Reprise / Trade-In</option>
                  <option value="GARAGE">Garages & Professionnels</option>
                  <option value="ASSURANCE">Assurance Auto</option>
                  <option value="ABONNEMENT">Abonnements & Tarifs</option>
                  <option value="PAIEMENT">Paiement & Facturation</option>
                  <option value="TECHNIQUE">Problème Technique</option>
                  <option value="AUTRE">Autre demande</option>
                </select>
                <p
                  *ngIf="sujetField?.invalid && sujetField?.touched"
                  class="text-xs text-red-500 mt-1 font-medium"
                >
                  Veuillez choisir un sujet.
                </p>
              </div>

              <!-- Message -->
              <div class="mb-8">
                <label
                  for="message"
                  class="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  [(ngModel)]="form.message"
                  required
                  rows="5"
                  placeholder="Décrivez votre demande en détail…"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                                 focus:ring-2 focus:ring-primary-300 focus:border-primary-500 focus:bg-white
                                 outline-none transition-all resize-none"
                  [class.border-red-400]="
                    messageField?.invalid && messageField?.touched
                  "
                  #messageField="ngModel"
                >
                </textarea>
                <div class="flex justify-between items-center mt-1">
                  <p
                    *ngIf="messageField?.invalid && messageField?.touched"
                    class="text-xs text-red-500 font-medium"
                  >
                    Le message est requis.
                  </p>
                  <p class="text-xs text-gray-400 ml-auto">
                    {{ form.message.length }} caractères
                  </p>
                </div>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                [disabled]="isSending"
                class="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-primary-600 text-white
                             rounded-xl font-bold text-sm hover:bg-primary-700 active:scale-[0.99]
                             disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-200"
              >
                <span
                  *ngIf="isSending"
                  class="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"
                >
                </span>
                <lucide-angular
                  *ngIf="!isSending"
                  [img]="icons.Send"
                  size="18"
                ></lucide-angular>
                {{ isSending ? 'Envoi en cours…' : 'Envoyer le message' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Map Placeholder ── -->
    <div
      class="w-full bg-gray-100 border-t border-gray-200 overflow-hidden"
      style="height: 280px;"
    >
      <div
        class="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4"
      >
        <div
          class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center"
        >
          <lucide-angular
            [img]="icons.MapPin"
            size="28"
            class="text-primary-500"
          ></lucide-angular>
        </div>
        <div class="text-center">
          <p class="text-sm font-bold text-gray-600">
            Plateau, Dakar – Sénégal
          </p>
          <p class="text-xs text-gray-400 mt-1">
            Carte interactive disponible prochainement
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ContactComponent {
  readonly icons = {
    MapPin,
    Phone,
    Mail,
    Clock,
    Send,
    CheckCircle,
    MessageSquare,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Car,
    ChevronRight,
  };

  submitted = signal(false);
  isSending = false;

  form: ContactForm = this.emptyForm();

  constructor(private toastService: ToastService) {}

  onSubmit(): void {
    if (
      !this.form.prenom ||
      !this.form.nom ||
      !this.form.email ||
      !this.form.sujet ||
      !this.form.message
    ) {
      return;
    }

    this.isSending = true;

    // Simulate async submission (replace with real API call when endpoint available)
    setTimeout(() => {
      this.isSending = false;
      this.submitted.set(true);
      this.toastService.success('Votre message a bien été envoyé !');
    }, 1200);
  }

  resetForm(): void {
    this.form = this.emptyForm();
    this.submitted.set(false);
  }

  private emptyForm(): ContactForm {
    return {
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      sujet: '',
      message: '',
    };
  }
}
