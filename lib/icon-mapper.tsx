import { 
  Code, Target, Lightbulb, User, Briefcase, Calendar,
  GraduationCap, Award, BookOpen, Trophy, Star, TrendingUp,
  Mail, Phone, MapPin, Linkedin, Github, Twitter,
  FileText, Mic, Users, Rocket, Coffee, Music, Gamepad2, Heart, Zap
} from "lucide-react"

const iconMap: Record<string, React.ComponentType<any>> = {
  Code,
  Target,
  Lightbulb,
  User,
  Briefcase,
  Calendar,
  GraduationCap,
  Award,
  BookOpen,
  Trophy,
  Star,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Twitter,
  FileText,
  Mic,
  Users,
  Rocket,
  Coffee,
  Music,
  Gamepad2,
  Heart,
  Zap
}

export function getIcon(iconName?: string | null, defaultIcon = User) {
  if (!iconName) return defaultIcon
  return iconMap[iconName] || defaultIcon
}

