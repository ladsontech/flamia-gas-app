
import React from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Flame, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";

const GasSafetyTips = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer flex flex-col items-center justify-center">
          <Flame className="h-3.5 w-3.5 mb-0.5" />
          <span className="text-[10px] leading-none">Safety</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center text-xl font-bold text-flame-inner">
            <Flame className="mr-2 h-5 w-5 text-flame-inner" />
            Gas Safety Tips
          </DialogTitle>
        </DialogHeader>

        <Separator className="my-2" />
        
        <div className="text-sm text-muted-foreground text-center mb-4">
          Essential safety tips for using cooking gas safely at home
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="font-semibold text-flame-middle">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 mr-2">
                  <span className="text-accent">1</span>
                </div>
                Proper Storage & Handling
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-3 border-l-4 border-l-accent bg-accent/5">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Store the gas cylinder upright</strong> in a well-ventilated area.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Keep it away from direct sunlight, heat sources, and flames.</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Ensure the regulator is properly fitted</strong> and not leaking.</span>
                  </li>
                </ul>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="font-semibold text-flame-middle">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 mr-2">
                  <span className="text-accent">2</span>
                </div>
                Checking for Leaks
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-3 border-l-4 border-l-accent bg-accent/5">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Perform the "soapy water test"</strong> – Apply soapy water to the cylinder valve and hose connections. If bubbles form, there's a leak.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Never use a match or lighter</strong> to check for gas leaks!</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>If you smell gas, do NOT ignite anything.</strong> Turn off the gas and open doors/windows.</span>
                  </li>
                </ul>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="font-semibold text-flame-middle">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 mr-2">
                  <span className="text-accent">3</span>
                </div>
                Safe Usage While Cooking
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-3 border-l-4 border-l-accent bg-accent/5">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Turn off the gas when not in use.</strong></span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Never leave cooking unattended</strong> when using gas.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Use the right-sized burner for your pots</strong> to prevent flames from reaching the gas hose.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Keep flammable items (curtains, papers, oils) away</strong> from the gas stove.</span>
                  </li>
                </ul>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="font-semibold text-flame-middle">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 mr-2">
                  <span className="text-accent">4</span>
                </div>
                Maintenance & Inspection
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-3 border-l-4 border-l-accent bg-accent/5">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Regularly check the gas hose and regulator</strong> for cracks or damage. Replace if worn out.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Have a qualified technician inspect your gas system</strong> every 6-12 months.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-accent mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Use only certified regulators and hoses</strong> from reputable dealers.</span>
                  </li>
                </ul>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="font-semibold text-destructive">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                What to Do in Case of a Gas Leak?
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="p-3 border-l-4 border-l-destructive bg-destructive/5">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>DO NOT switch on/off any electrical appliances</strong> (this can cause a spark).</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Turn off the gas valve immediately</strong> and move the cylinder outside.</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Open all doors and windows</strong> to let the gas escape.</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Do NOT light a match, candle, or any open flame.</strong></span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-destructive mr-2 mt-0.5 flex-shrink-0" />
                    <span><strong>Call for professional help if the leak persists.</strong></span>
                  </li>
                </ul>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-4 bg-muted/20 p-3 rounded-lg border border-muted flex items-start">
          <Info className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            For more information or assistance with gas safety, contact our gas experts via WhatsApp at <a href="https://wa.me/256787899483" className="text-accent font-medium">+256 787 899 483</a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GasSafetyTips;
