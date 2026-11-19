import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, PlusCircle, Send } from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { DateRangeField } from "@/components/dateRangeField";
import { FormField } from "@/components/formField";
import { LoadingScreen } from "@/components/loadingScreen";
import { Notice } from "@/components/notice";
import { formatShortDate } from "@/lib/dateFormat";
import { usePeriodItems } from "@/hooks/usePeriodItems";
import { useAdminMonitoring } from "@/hooks/useAdminMonitoring";
import { useOrganizations } from "@/hooks/useOrganizations";
import { buildPeriodItem, parseKeywords } from "../../services/periodEntry";
import { PeriodItemList } from "../../components/periodItemList";
import type { MonitoringFeedback } from "./types";
import { Form, PeriodRow, Stack, TwoColumns } from "./styles";

export function MonitoringPage() {
  const {
    organizations,
    isLoading: organizationsLoading,
    error: organizationsError,
  } = useOrganizations();
  const [organizationId, setOrganizationId] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [itemType, setItemType] = useState("news");
  const [periodDates, setPeriodDates] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [feedback, setFeedback] = useState<MonitoringFeedback | null>(null);
  const [busy, setBusy] = useState(false);
  const monitoring = useAdminMonitoring(organizationId || null);
  const selectedPeriod = monitoring.periods.find(
    (period) => period.id === selectedPeriodId,
  );
  const periodItems = usePeriodItems(
    selectedPeriod?.status === "processing" ? selectedPeriodId : null,
  );

  useEffect(() => {
    if (!organizationId && organizations.length > 0) {
      setOrganizationId(
        organizations.find((organization) => organization.active)?.id ?? "",
      );
    }
  }, [organizationId, organizations]);

  useEffect(() => {
    if (!monitoring.periods.some((period) => period.id === selectedPeriodId)) {
      setSelectedPeriodId(
        monitoring.periods.find((period) => period.status === "processing")
          ?.id ?? "",
      );
    }
  }, [monitoring.periods, selectedPeriodId]);

  async function runAction(
    action: () => Promise<void>,
    successMessage: string,
  ) {
    setBusy(true);
    setFeedback(null);

    try {
      await action();
      setFeedback({ tone: "success", message: successMessage });
    } catch (reason) {
      setFeedback({
        tone: "error",
        message:
          reason instanceof Error
            ? reason.message
            : "Não foi possível salvar as informações.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function submitChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name"));
    await runAction(async () => {
      await monitoring.createChannel(name);
      form.reset();
    }, "Canal cadastrado.");
  }

  async function submitTopic(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    await runAction(async () => {
      await monitoring.createTopic(
        String(values.get("name")),
        parseKeywords(String(values.get("keywords"))),
      );
      form.reset();
    }, "Assunto monitorado cadastrado.");
  }

  async function submitPeriod(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const startDate = String(values.get("startDate") ?? "");
    const endDate = String(values.get("endDate") ?? "");

    if (!startDate || !endDate) {
      setFeedback({
        tone: "error",
        message: "Selecione a data inicial e a data final do período.",
      });
      return;
    }

    await runAction(async () => {
      await monitoring.createPeriod(startDate, endDate);
      form.reset();
      setPeriodDates([null, null]);
    }, "Período criado como processamento; ele só ficará visível após a publicação.");
  }

  async function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    try {
      const item = buildPeriodItem(new FormData(form));
      await runAction(async () => {
        await monitoring.createItem(selectedPeriodId, item);
        await periodItems.refresh();
        form.reset();
        setItemType("news");
      }, "Registro adicionado ao período.");
    } catch (reason) {
      setFeedback({
        tone: "error",
        message: reason instanceof Error ? reason.message : "Confira os dados.",
      });
    }
  }

  if (organizationsLoading)
    return <LoadingScreen label="Carregando organizações" />;
  if (organizationsError)
    return <Notice tone="error">{organizationsError}</Notice>;

  const activeOrganizations = organizations.filter(
    (organization) => organization.active,
  );

  return (
    <Stack>
      {activeOrganizations.length === 0 ? (
        <Notice>
          Cadastre uma organização ativa antes de configurar o monitoramento.
        </Notice>
      ) : (
        <Card
          title="Organização monitorada"
          subtitle="A configuração dos canais, assuntos e relatórios é feita por organização."
        >
          <FormField
            as="select"
            label="Organização"
            value={organizationId}
            options={activeOrganizations.map((organization) => ({
              value: organization.id,
              label: organization.name,
            }))}
            onChange={(value) => {
              setOrganizationId(value);
              setSelectedPeriodId("");
            }}
          />
        </Card>
      )}

      {feedback && <Notice tone={feedback.tone}>{feedback.message}</Notice>}
      {monitoring.error && <Notice tone="error">{monitoring.error}</Notice>}
      {monitoring.isLoading && <LoadingScreen label="Atualizando dados" />}

      {organizationId && (
        <>
          <TwoColumns>
            <Card title="Canais de comunicação">
              <Form onSubmit={(event) => void submitChannel(event)}>
                <FormField
                  label="Nome do canal"
                  name="name"
                  placeholder="Ex.: Instagram"
                  required
                  maxLength={80}
                />
                <Button type="submit" size="small" disabled={busy}>
                  <PlusCircle size={15} /> Adicionar canal
                </Button>
              </Form>
              {monitoring.channels.length === 0 ? (
                <p>Nenhum canal cadastrado.</p>
              ) : (
                monitoring.channels.map((channel) => (
                  <PeriodRow key={channel.id}>
                    <p>
                      {channel.name} · {channel.active ? "Ativo" : "Inativo"}
                    </p>
                    <Button
                      size="small"
                      variant={channel.active ? "secondary" : "primary"}
                      disabled={busy}
                      onClick={() =>
                        void runAction(
                          () =>
                            monitoring.setChannelActive(
                              channel.id,
                              !channel.active,
                            ),
                          `Canal ${channel.active ? "desativado" : "ativado"}.`,
                        )
                      }
                    >
                      {channel.active ? "Desativar" : "Ativar"}
                    </Button>
                  </PeriodRow>
                ))
              )}
            </Card>
            <Card title="Assuntos e palavras-chave">
              <Form onSubmit={(event) => void submitTopic(event)}>
                <FormField
                  label="Assunto"
                  name="name"
                  required
                  maxLength={120}
                />
                <FormField
                  label="Palavras-chave (separadas por vírgula)"
                  name="keywords"
                  required
                />
                <Button
                  type="submit"
                  size="small"
                  variant="secondary"
                  disabled={busy}
                >
                  <PlusCircle size={15} /> Adicionar assunto
                </Button>
              </Form>
              {monitoring.topics.length === 0 ? (
                <p>Nenhum assunto cadastrado.</p>
              ) : (
                monitoring.topics.map((topic) => (
                  <PeriodRow key={topic.id}>
                    <p>
                      {topic.name} · {topic.active ? "Ativo" : "Inativo"}
                      <br />
                      {topic.keywords.join(", ")}
                    </p>
                    <Button
                      size="small"
                      variant={topic.active ? "secondary" : "primary"}
                      disabled={busy}
                      onClick={() =>
                        void runAction(
                          () =>
                            monitoring.setTopicActive(topic.id, !topic.active),
                          `Assunto ${topic.active ? "desativado" : "ativado"}.`,
                        )
                      }
                    >
                      {topic.active ? "Desativar" : "Ativar"}
                    </Button>
                  </PeriodRow>
                ))
              )}
            </Card>
          </TwoColumns>

          <TwoColumns>
            <Card
              title="Abrir período diário"
              subtitle="Os dados ficam em processamento até a revisão e publicação."
            >
              <Form onSubmit={(event) => void submitPeriod(event)}>
                <DateRangeField
                  label="Período de monitoramento"
                  value={periodDates}
                  onChange={setPeriodDates}
                  startName="startDate"
                  endName="endDate"
                />
                <Button type="submit" disabled={busy}>
                  <PlusCircle size={16} /> Criar período
                </Button>
              </Form>
            </Card>
            <Card title="Períodos de monitoramento">
              {monitoring.periods.length === 0 ? (
                <p>Nenhum período cadastrado.</p>
              ) : (
                monitoring.periods.map((period) => (
                  <PeriodRow key={period.id}>
                    <p>
                      {formatShortDate(period.startDate)} a{" "}
                      {formatShortDate(period.endDate)} ·{" "}
                      {period.status === "published"
                        ? "Publicado"
                        : "Em processamento"}
                    </p>
                    {period.status === "processing" && (
                      <Button
                        size="small"
                        onClick={() =>
                          void runAction(
                            () => monitoring.publishPeriod(period.id),
                            "Período publicado e disponível para consulta.",
                          )
                        }
                      >
                        <Send size={14} /> Publicar
                      </Button>
                    )}
                  </PeriodRow>
                ))
              )}
            </Card>
          </TwoColumns>

          {selectedPeriod && selectedPeriod.status === "processing" && (
            <Card
              title="Alimentar período"
              subtitle={`${formatShortDate(selectedPeriod.startDate)} a ${formatShortDate(selectedPeriod.endDate)}`}
            >
              <Form onSubmit={(event) => void submitItem(event)}>
                <FormField
                  as="select"
                  label="Tipo de registro"
                  name="type"
                  value={itemType}
                  onChange={setItemType}
                  options={[
                    { value: "news", label: "Notícia" },
                    { value: "comment", label: "Comentário analisado" },
                    {
                      value: "recommendation",
                      label: "Recomendação estratégica",
                    },
                  ]}
                />

                {itemType === "news" && (
                  <>
                    <FormField
                      as="select"
                      label="Canal"
                      name="channelId"
                      required
                      options={[
                        { value: "", label: "Selecione" },
                        ...monitoring.channels
                          .filter((channel) => channel.active)
                          .map((channel) => ({
                            value: channel.id,
                            label: channel.name,
                          })),
                      ]}
                    />
                    <FormField
                      label="Título"
                      name="title"
                      required
                      maxLength={500}
                    />
                    <FormField
                      label="Link da fonte (opcional)"
                      name="sourceUrl"
                      type="url"
                    />
                    <FormField
                      label="Data e hora"
                      name="publishedAt"
                      type="datetime-local"
                      required
                    />
                    <FormField
                      as="select"
                      label="Sentimento"
                      name="sentiment"
                      required
                      options={[
                        { value: "neutral", label: "Neutro" },
                        { value: "positive", label: "Positivo" },
                        { value: "negative", label: "Negativo" },
                      ]}
                    />
                    <FormField
                      as="textarea"
                      label="Anotações (opcional)"
                      name="notes"
                    />
                  </>
                )}

                {itemType === "comment" && (
                  <>
                    <FormField
                      as="select"
                      label="Canal"
                      name="channelId"
                      required
                      options={[
                        { value: "", label: "Selecione" },
                        ...monitoring.channels
                          .filter((channel) => channel.active)
                          .map((channel) => ({
                            value: channel.id,
                            label: channel.name,
                          })),
                      ]}
                    />
                    <FormField
                      as="textarea"
                      label="Comentário"
                      name="content"
                      required
                    />
                    <FormField
                      label="Data e hora"
                      name="commentedAt"
                      type="datetime-local"
                      required
                    />
                    <FormField
                      as="select"
                      label="Perfil do público"
                      name="profile"
                      required
                      options={[
                        { value: "militante", label: "Militante" },
                        { value: "simpatizante", label: "Simpatizante" },
                        { value: "detrator", label: "Detrator" },
                      ]}
                    />
                    <FormField
                      as="select"
                      label="Sentimento"
                      name="sentiment"
                      required
                      options={[
                        { value: "neutral", label: "Neutro" },
                        { value: "positive", label: "Positivo" },
                        { value: "negative", label: "Negativo" },
                      ]}
                    />
                  </>
                )}

                {itemType === "recommendation" && (
                  <>
                    <FormField
                      as="select"
                      label="Categoria"
                      name="category"
                      required
                      options={[
                        { value: "insight", label: "Insight" },
                        { value: "action", label: "Ação" },
                        { value: "example", label: "Exemplo" },
                      ]}
                    />
                    <FormField
                      as="textarea"
                      label="Conteúdo"
                      name="content"
                      required
                    />
                  </>
                )}

                <Button type="submit" disabled={busy || !selectedPeriodId}>
                  <CheckCircle2 size={16} /> Salvar registro
                </Button>
              </Form>
            </Card>
          )}

          {selectedPeriod && selectedPeriod.status === "processing" && (
            <Card
              title="Registros do período"
              subtitle="Você pode revisar, editar ou remover itens antes de publicar."
            >
              <PeriodItemList
                items={periodItems.items}
                isLoading={periodItems.isLoading}
                error={periodItems.error}
                onUpdate={periodItems.updateItem}
                onDelete={periodItems.deleteItem}
              />
            </Card>
          )}
        </>
      )}
    </Stack>
  );
}
