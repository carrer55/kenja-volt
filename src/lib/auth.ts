// ローカル認証システム
interface User {
  id: string;
  email: string;
  name: string;
  company: string;
  position: string;
  phone: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class LocalAuth {
  private static instance: LocalAuth;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false
  };
  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): LocalAuth {
    if (!LocalAuth.instance) {
      LocalAuth.instance = new LocalAuth();
    }
    return LocalAuth.instance;
  }

  constructor() {
    // ローカルストレージから認証状態を復元
    this.restoreAuthState();
  }

  private restoreAuthState() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.authState = {
          user: JSON.parse(savedUser),
          isAuthenticated: true
        };
      } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  private saveAuthState() {
    if (this.authState.user) {
      localStorage.setItem('currentUser', JSON.stringify(this.authState.user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    // デモアカウント
    if (email === 'demo' && password === 'pass9981') {
      const demoUser: User = {
        id: 'demo-user',
        email: 'demo',
        name: 'デモユーザー',
        company: '株式会社デモ',
        position: '代表取締役',
        phone: '090-0000-0000'
      };

      this.authState = {
        user: demoUser,
        isAuthenticated: true
      };

      this.saveAuthState();
      this.notifyListeners();
      return { success: true };
    }

    // 簡単なローカル認証（実際のプロダクションでは使用しない）
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      this.authState = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
          position: user.position,
          phone: user.phone
        },
        isAuthenticated: true
      };

      this.saveAuthState();
      this.notifyListeners();
      return { success: true };
    }

    return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' };
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    company: string;
    position: string;
    phone: string;
  }): Promise<{ success: boolean; error?: string }> {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // 既存ユーザーチェック
    if (users.some((u: any) => u.email === userData.email)) {
      return { success: false, error: 'このメールアドレスは既に登録されています' };
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData
    };

    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));

    // 自動ログイン
    this.authState = {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        company: newUser.company,
        position: newUser.position,
        phone: newUser.phone
      },
      isAuthenticated: true
    };

    this.saveAuthState();
    this.notifyListeners();
    return { success: true };
  }

  logout() {
    this.authState = {
      user: null,
      isAuthenticated: false
    };
    this.saveAuthState();
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  getAuthState(): AuthState {
    return this.authState;
  }
}

export const auth = LocalAuth.getInstance();
export type { User, AuthState };