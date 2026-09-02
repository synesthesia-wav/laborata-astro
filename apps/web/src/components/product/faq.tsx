import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { FAQ_ITEMS } from "./data";

interface Props {
  idSuffix?: string;
  name?: string;
}

export function Faq({ idSuffix = "faq", name = "Vitamina B12" }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-balance font-heading font-semibold text-2xl tracking-tight">
        Întrebări frecvente — {name}
      </h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Întrebări frecvente</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion
            className="px-(--card-spacing)"
            defaultValue={[FAQ_ITEMS[0].value]}
            id={`faq-${idSuffix}`}
          >
            {FAQ_ITEMS.map((item) => (
              <AccordionItem
                className="px-2 last:border-0"
                key={item.value}
                value={item.value}
              >
                <AccordionTrigger className="text-left text-sm">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs leading-relaxed">
        Nu găsești răspunsul? Scrie-ne din contul Laborata — răspundem în
        aceeași zi lucrătoare.
      </p>
    </div>
  );
}
