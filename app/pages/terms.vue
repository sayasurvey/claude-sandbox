<template>
  <div class="page-wrapper">
    <div class="content-container">
      <div class="header">
        <button class="back-btn" @click="router.back()">
          <ArrowLeft class="w-4 h-4" />
          <span>戻る</span>
        </button>
        <h1 class="page-title">利用規約</h1>
        <p class="page-meta">制定日：2026年4月2日</p>
      </div>

      <div class="terms-body">
        <p class="intro">
          本利用規約（以下「本規約」）は、スケジュール管理アプリ（以下「本サービス」）の利用条件を定めるものです。
          本サービスを利用された場合、本規約に同意したものとみなします。
        </p>

        <div class="notice-box">
          <AlertTriangle class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p class="text-sm text-amber-800">
            本サービスはAIを使用して作成されており、個人が試験的に運営するサービスです。
            予告なくサービスを終了・データを削除する場合があります。重要なデータのバックアップは各自で行ってください。
          </p>
        </div>

        <section class="terms-section">
          <h2 class="section-title">第1条（適用）</h2>
          <p>
            本規約は、本サービスの利用に関して、ユーザーと運営者との間に適用されます。
            本サービスを利用した場合、本規約の全条項に同意したものとみなします。
          </p>
        </section>

        <section class="terms-section">
          <h2 class="section-title">第2条（AIによる作成）</h2>
          <p>
            本サービスは、AIツールを活用して作成・開発されております。
            AIによる生成物を含む性質上、予期しない動作・不具合が発生する可能性があることをご了承ください。
          </p>
        </section>

        <section class="terms-section">
          <h2 class="section-title">第3条（利用登録）</h2>
          <p>
            本サービスの利用にはメールアドレスとパスワードによるアカウント登録が必要です。
            登録情報は正確・最新の状態を維持してください。
            虚偽の情報による登録が判明した場合、予告なくアカウントを削除することがあります。
          </p>
        </section>

        <section class="terms-section">
          <h2 class="section-title">第4条（禁止事項）</h2>
          <p>ユーザーは以下の行為を行ってはなりません。</p>
          <ul class="list">
            <li>法令または公序良俗に反する行為</li>
            <li>本サービスのサーバー・ネットワークに過度な負荷をかける行為</li>
            <li>他のユーザーまたは第三者の権利・利益を侵害する行為</li>
            <li>本サービスの運営を妨げる行為</li>
            <li>その他、運営者が不適切と判断する行為</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2 class="section-title">第5条（サービスの終了）</h2>
          <p>
            運営者は、以下の場合を含む理由により、<strong>予告なく本サービスを終了することがあります</strong>。
            サービス終了に際してユーザーへの補償・通知義務は負いません。
          </p>
          <ul class="list">
            <li>運営者の都合によるサービス停止・終了</li>
            <li>技術的な問題によるサービス継続困難</li>
            <li>法令・規制への対応</li>
            <li>その他、運営者が必要と判断した場合</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2 class="section-title">第6条（登録データの削除）</h2>
          <p>
            運営者は、以下の場合に<strong>予告なくユーザーの登録データを削除することがあります</strong>。
            データ削除に際して運営者はいかなる補償も行いません。
            重要なデータは各自でバックアップを取ることを強く推奨します。
          </p>
          <ul class="list">
            <li>サービス終了時</li>
            <li>長期間ログインのないアカウントのデータ整理</li>
            <li>ストレージ容量等の技術的な都合</li>
            <li>禁止事項に違反したアカウントへの対応</li>
            <li>その他、運営者が必要と判断した場合</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2 class="section-title">第7条（免責事項）</h2>
          <p>
            本サービスに関して、<strong>いかなる内容においても運営者は一切の責任を負いません</strong>。
            これには以下を含みますが、これらに限りません。
          </p>
          <ul class="list">
            <li>本サービスの中断・停止・終了によって生じた損害</li>
            <li>登録データの紛失・破損・削除によって生じた損害</li>
            <li>本サービスの利用によって生じた直接的・間接的な損害</li>
            <li>本サービスの不具合・誤作動によって生じた損害</li>
            <li>セキュリティ上の問題によって生じた損害</li>
            <li>ユーザー間またはユーザーと第三者との間で生じたトラブル</li>
          </ul>
        </section>

        <section class="terms-section">
          <h2 class="section-title">第8条（知的財産権）</h2>
          <p>
            本サービスに含まれるコンテンツ・デザイン・プログラム等の知的財産権は、運営者または正当な権利者に帰属します。
            ユーザーが本サービスに登録したデータの権利はユーザーに帰属します。
          </p>
        </section>

        <section class="terms-section">
          <h2 class="section-title">第9条（規約の変更）</h2>
          <p>
            運営者は、必要に応じて本規約を変更することがあります。
            変更後の規約は本ページに掲載された時点で効力を生じ、継続して本サービスを利用した場合は変更に同意したものとみなします。
          </p>
        </section>

        <section class="terms-section">
          <h2 class="section-title">第10条（準拠法）</h2>
          <p>
            本規約の解釈は日本法に準拠するものとします。
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, AlertTriangle } from 'lucide-vue-next'

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

.terms-body {
  @apply bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6;
}

.intro {
  @apply text-sm text-gray-700 leading-relaxed;
}

.notice-box {
  @apply flex gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4;
}

.terms-section {
  @apply space-y-2;
}

.section-title {
  @apply text-base font-semibold text-gray-900 border-b border-gray-100 pb-1;
}

.terms-section p {
  @apply text-sm text-gray-700 leading-relaxed;
}

.terms-section strong {
  @apply font-semibold text-gray-900;
}

.list {
  @apply text-sm text-gray-700 space-y-1 pl-5 list-disc;
}
</style>
