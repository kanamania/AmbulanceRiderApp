# Quick Reference: Multi-Language & Dark Mode

## 🚀 Quick Start

### Using Translations in Your Component

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <h1>{t('common.welcome')}</h1>;
};
```

### Using Theme Toggle

```typescript
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current: {isDark ? 'Dark' : 'Light'}
    </button>
  );
};
```

### Using AppHeader

```typescript
import { useTranslation } from 'react-i18next';
import AppHeader from '../components/AppHeader';

const MyPage = () => {
  const { t } = useTranslation();
  
  return (
    <IonPage>
      <AppHeader title={t('navigation.myPage')} />
      <IonContent>{/* content */}</IonContent>
    </IonPage>
  );
};
```

---

## 📝 Common Translation Keys

### Navigation
- `navigation.home` - Nyumbani / Home
- `navigation.profile` - Wasifu / Profile
- `navigation.settings` - Mipangilio / Settings
- `navigation.admin` - Msimamizi / Admin

### Common Actions
- `common.save` - Hifadhi / Save
- `common.cancel` - Ghairi / Cancel
- `common.delete` - Futa / Delete
- `common.edit` - Hariri / Edit
- `common.search` - Tafuta / Search
- `common.loading` - Inapakia... / Loading...

### Authentication
- `auth.email` - Barua pepe / Email
- `auth.password` - Nywila / Password
- `auth.login` - Ingia / Login
- `auth.logout` - Toka / Logout
- `auth.register` - Jisajili / Register

### Validation
- `validation.required` - Sehemu hii inahitajika / This field is required
- `validation.emailInvalid` - Barua pepe si sahihi / Invalid email
- `validation.passwordTooShort` - Nywila ni fupi sana / Password too short

---

## 🎨 Theme Classes

### Check Current Theme
```typescript
const { isDark } = useTheme();
```

### Apply Dark Mode Styles
```css
.my-component {
  background: white;
  color: black;
}

.dark .my-component {
  background: #1a1a1a;
  color: white;
}
```

---

## 🌍 Supported Languages

- **sw** - Kiswahili (Default)
- **en** - English

---

## 💾 Persistence

Both language and theme preferences are automatically saved to `localStorage`:
- Language: `i18nextLng`
- Theme: `theme`

---

## 🔧 Configuration

### Default Settings
- **Language**: Swahili (sw)
- **Theme**: Light Mode
- **Detection**: localStorage → browser language
- **Persistence**: Automatic

---

## 📱 UI Controls Location

**Top-right corner of every page:**
1. Language Selector (dropdown)
2. Theme Toggle (button with icon)

---

## ✅ Implementation Checklist

When adding a new page:
- [ ] Import `useTranslation` hook
- [ ] Replace hardcoded text with `t('key')`
- [ ] Use `AppHeader` component
- [ ] Add translation keys to both `en.json` and `sw.json`
- [ ] Test language switching
- [ ] Test dark mode appearance

---

## 🐛 Troubleshooting

**Translation not showing?**
- Check key exists in both language files
- Verify no typos in translation key
- Check browser console for errors

**Dark mode not working?**
- Verify ThemeProvider wraps your app
- Check localStorage is enabled
- Clear cache and reload

**Language not persisting?**
- Check localStorage permissions
- Verify i18n is initialized
- Check browser console

---

## 📚 Full Documentation

See `MULTILANGUAGE_DARKMODE_IMPLEMENTATION.md` for complete details.
