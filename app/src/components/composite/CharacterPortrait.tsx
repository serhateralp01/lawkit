/**
 * CharacterPortrait — geriye uyumluluk için HumanAvatar'ı re-export eder.
 *
 * Mevcut "TG/SH inisiyal yuvarlağı" tasarımından "SVG insan silüeti + blur yüz"
 * tasarımına geçildi. API aynı kaldı; tüm çağrı yerleri otomatik yeni avatarı
 * kullanır.
 */

export { HumanAvatar as CharacterPortrait, roleLabel } from "./HumanAvatar";
