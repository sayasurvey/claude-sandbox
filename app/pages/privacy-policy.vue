<template>
  <div class="page-wrapper">
    <div class="content-container">
      <div class="header">
        <button class="back-btn" @click="router.back()">
          <ArrowLeft class="w-4 h-4" />
          <span>戻る</span>
        </button>
        <h1 class="page-title">プライバシーポリシー</h1>
        <p class="page-meta">制定日：2026年4月2日</p>
      </div>

      <div class="policy-body">
        <p class="intro">
          本プライバシーポリシー（以下「本ポリシー」）は、スケジュール管理アプリ（以下「本サービス」）における
          ユーザーの個人情報の取り扱いについて定めるものです。
        </p>

        <section class="policy-section">
          <h2 class="section-title">第1条（収集する情報）</h2>
          <p>本サービスは、以下の情報を収集します。</p>
          <ul class="list">
            <li>メールアドレス（アカウント登録時）</li>
            <li>パスワード（Firebase Authentication により暗号化して管理）</li>
            <li>ユーザーが登録した案件名・スケジュール情報等のデータ</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2 class="section-title">第2条（情報の利用目的）</h2>
          <p>収集した情報は、以下の目的に限り使用します。</p>
          <ul class="list">
            <li>本サービスのアカウント認証および提供</li>
            <li>ユーザーが登録したデータの表示・管理</li>
            <li>サービスの不具合対応・改善</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2 class="section-title">第3条（第三者提供）</h2>
          <p>
            本サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
          </p>
          <ul class="list">
            <li>ユーザーご本人の同意がある場合</li>
            <li>法令に基づき開示が必要な場合</li>
          </ul>
        </section>

        <section class="policy-section">
          <h2 class="section-title">第4条（利用するサービス）</h2>
          <p>本サービスは、以下の外部サービスを利用しています。各サービスのプライバシーポリシーもあわせてご確認ください。</p>
          <ul class="list">
            <li>
              Google Firebase（認証・データベース）<br>
              <span class="text-sm text-gray-500">Google LLC が提供するクラウドサービス</span>
            </li>
            <li>
              Vercel（ホスティング）<br>
              <span class="text-sm text-gray-500">Vercel Inc. が提供するホスティングサービス</span>
            </li>
          </ul>
        </section>

        <section class="policy-section">
          <h2 class="section-title">第5条（データの保管と削除）</h2>
          <p>
            ユーザーのデータは Google Firebase（Firestore）上に保管されます。
            ユーザーはアカウントを削除することで、登録データの削除を申請できます。
            ただし、サービスの都合により予告なくデータが削除される場合があります（詳細は利用規約をご確認ください）。
          </p>
        </section>

        <section class="policy-section">
          <h2 class="section-title">第6条（Cookieの使用）</h2>
          <p>
            本サービスは、Firebase Authentication のセッション管理のために Cookie を使用します。
            ブラウザの設定により Cookie を無効にすることができますが、その場合は本サービスの一部機能が利用できなくなる場合があります。
          </p>
        </section>

        <section class="policy-section">
          <h2 class="section-title">第7条（セキュリティ）</h2>
          <p>
            本サービスは、ユーザーの情報を適切に管理するために合理的なセキュリティ対策を講じています。
            ただし、インターネット上での情報送受信において完全なセキュリティを保証することはできません。
          </p>
        </section>

        <section class="policy-section">
          <h2 class="section-title">第8条（お問い合わせ）</h2>
          <p>
            本サービス、本ポリシーに関するお問い合わせは、X（旧Twitter）のDMよりご連絡ください。<br>
            <a href="https://x.com/Runteq_sayaka" target="_blank" rel="noopener noreferrer" class="contact-link">@Runteq_sayaka</a>
          </p>
          
        </section>

        <section class="policy-section">
          <h2 class="section-title">第9条（ポリシーの変更）</h2>
          <p>
            本ポリシーの内容は、予告なく変更することがあります。
            変更後のポリシーは本ページに掲載された時点で効力を生じるものとします。
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

definePageMeta({
  layout: false,
  ssr: false,
})

const router = useRouter()
</script>

<style scoped>
@reference "tailwindcss";

.page-wrapper {
  @apply min-h-screen bg-gray-50 py-8 px-4;
}

.content-container {
  @apply max-w-2xl mx-auto;
}

.header {
  @apply mb-8;
}

.back-btn {
  @apply flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mb-4 transition-colors;
}

.page-title {
  @apply text-2xl font-bold text-gray-900;
}

.page-meta {
  @apply text-sm text-gray-500 mt-1;
}

.policy-body {
  @apply bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6;
}

.intro {
  @apply text-sm text-gray-700 leading-relaxed;
}

.policy-section {
  @apply space-y-2;
}

.section-title {
  @apply text-base font-semibold text-gray-900 border-b border-gray-100 pb-1;
}

.policy-section p {
  @apply text-sm text-gray-700 leading-relaxed;
}

.list {
  @apply text-sm text-gray-700 space-y-1 pl-5 list-disc;
}

.contact-link {
  @apply text-blue-600 hover:text-blue-800 underline transition-colors;
}
</style>
